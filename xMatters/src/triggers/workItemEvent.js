//Try to parse request body
try {
    var payload = JSON.parse(request.body);
} catch (e) {
    throw new Error('Cannot parse request body: \n' + request.body);
}

//Verify that the notifiation type is for a workitem
if (payload.eventType === 'undefined' || payload.eventType.includes('workitem.') == false) {
    throw new Error('Not an Azure DevOps work item notification. \n' + request.body);
}

//Load standard notification output fields
output.subscriptionId = payload.subscriptionId;
output.notificationNumber = payload.notificationId;
output.notificationId = payload.id;
output.notificationEventType = payload.eventType;
output.messageText = payload.message.text;
output.messageHtml = payload.message.html;
output.messageMarkdown = payload.message.markdown;
output.detailedText = payload.detailedMessage.text;
output.detailedHtml = payload.detailedMessage.html;
output.detailedMarkdown = payload.detailedMessage.markdown;

//If it was a workitem.delete action do not set workitem URL
if (payload.eventType != 'workitem.delete') {
    output.workItemUrl = payload.resource._links.html.href;
}

//Get the organization name from one of the URLs
re = new RegExp('(?<=^https:\/\/dev.azure.com/).+?(?=\/)', 'gs');
organization = payload.resource.url.match(re);
output.organization = organization[0];

//Set lists of field names for the different types of workitems to use for loading values
var commonWorkItemFields = ['System.AreaPath','System.TeamProject','System.IterationPath','System.WorkItemType','System.State','System.Reason','System.AssignedTo','System.CreatedDate','System.CreatedBy','System.ChangedDate','System.ChangedBy','System.CommentCount','System.Title','Microsoft.VSTS.Common.StateChangeDate','Microsoft.VSTS.Common.Priority','System.Tags','Microsoft.VSTS.Common.ActivatedDate','Microsoft.VSTS.Common.ActivatedBy'];
var bugWorkItemFields = ['Microsoft.VSTS.Common.ValueArea','Microsoft.VSTS.Scheduling.StoryPoints','Microsoft.VSTS.Scheduling.RemainingWork','Microsoft.VSTS.Scheduling.OriginalEstimate','Microsoft.VSTS.Scheduling.CompletedWork','Microsoft.VSTS.Common.Severity','Microsoft.VSTS.TCM.SystemInfo'];
var epicFeatureWorkItemFields = ['System.Description','Microsoft.VSTS.Common.ValueArea','Microsoft.VSTS.Common.Risk','Microsoft.VSTS.Scheduling.TargetDate','Microsoft.VSTS.Common.BusinessValue','Microsoft.VSTS.Common.TimeCriticality','Microsoft.VSTS.Scheduling.Effort','Microsoft.VSTS.Scheduling.StartDate'];
var issueWorkItemFields = ['Microsoft.VSTS.Common.StackRank','Microsoft.VSTS.Scheduling.DueDate'];
var taskWorkItemFields = ['Microsoft.VSTS.Scheduling.RemainingWork','Microsoft.VSTS.Scheduling.OriginalEstimate','Microsoft.VSTS.Scheduling.CompletedWork'];
var userStoryWorkItemFields = ['Microsoft.VSTS.Common.ValueArea','Microsoft.VSTS.Common.Risk','Microsoft.VSTS.Scheduling.StoryPoints','System.BoardColumn','System.BoardColumnDone','Microsoft.VSTS.Common.AcceptanceCriteria'];
var testCaseWorkItemFields = ['Microsoft.VSTS.TCM.AutomationStatus','Microsoft.VSTS.TCM.Steps','Microsoft.VSTS.TCM.LocalDataSource'];

//Load values common for all work item types
loadValues(commonWorkItemFields, payload.eventType);

//Load values specific to each work item type
if (payload.resource.fields['System.WorkItemType'] == 'Bug'){
    output['workItemDescription'] = payload.resource.fields['Microsoft.VSTS.TCM.ReproSteps'];
    loadValues(bugWorkItemFields, payload.eventType);
} else if (payload.resource.fields['System.WorkItemType'] == 'Epic' || payload.resource.fields['System.WorkItemType'] == 'Feature') {
    output['workItemDescription'] = payload.resource.fields['System.Description'];
    loadValues(epicFeatureWorkItemFields, payload.eventType);
} else if (payload.resource.fields['System.WorkItemType'] == 'Issue') {
    output['workItemDescription'] = payload.resource.fields['System.Description'];
    loadValues(issueWorkItemFields, payload.eventType);
} else if (payload.resource.fields['System.WorkItemType'] == 'Task') {
    output['workItemDescription'] = payload.resource.fields['System.Description'];
    loadValues(taskWorkItemFields, payload.eventType);
} else if (payload.resource.fields['System.WorkItemType'] == 'User Story') {
    output['workItemDescription'] = payload.resource.fields['System.Description'];
    loadValues(userStoryWorkItemFields, payload.eventType);
} else if (payload.resource.fields['System.WorkItemType'] == 'Test Case') {
    output['workItemDescription'] = payload.resource.fields['System.Description'];
    loadValues(testCaseWorkItemFields, payload.eventType);
}


function loadValues(workItemFields, eventType) {
    //Check if event type is an update, because updated work item fields paths are slightly different
    if (eventType != 'workitem.update') {
        output['workItemId'] = payload.resource.id;
        for (field in workItemFields) {
            fieldName = workItemFields[field].split('.').pop();
            output['workItem' + fieldName] = payload.resource.fields[workItemFields[field]];
        }
    } else if (eventType == 'workitem.update') {
        output['workItemId'] = payload.resource.revision.id;
        for (field in workItemFields) {
            fieldName = workItemFields[field].split('.').pop();
            output['workItem' + fieldName] = payload.resource.revision.fields[workItemFields[field]];
        }
    } else {
        console.log('ERROR: Unable to load output fields, because unknown event type.');
    }
}


