//Try to parse request body
try {
    var payload = JSON.parse(request.body);
} catch (e) {
    throw new Error('Cannot parse request body: \n' + request.body);
}

//Verify that the notifiation type is for a workitem
if (payload.eventType === 'undefined' || payload.eventType.includes('workitem.') == false) {
    console.log('Event Type:' + payload.eventType);
    throw new Error('Not an Azure DevOps work item event notification. \n' + request.body);
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

//If it was not a workitem.delete action set workitem URL
if (payload.eventType != 'workitem.delete') {
    output.workItemUrl = payload.resource._links.html.href;
}

//Get the organization name from one of the URLs
re = new RegExp('(?<=^https:\/\/dev.azure.com/).+?(?=\/)', 'gs');
organization = payload.resource.url.match(re);
output.organization = organization[0];

/** 
 * Check if event type is an update, because updated work item field paths are slightly different.
 * Then load each field into a step output. Each output will take the Azure DevOps work item field
 * and prefix it with "workItem" to create the output name.
 * 
 * The default trigger step only has outputs defined for basic work item information. If you view 
 * the step output in the Activity monitor it will have many more outputs. To make one of these 
 * outputs available to other steps you must add it to the OUTPUTS section of the HTTP trigger 
 * settings.
 */
 
if (payload.eventType != 'workitem.updated') {
    output['workItemId'] = payload.resource.id;
    for (field in payload.resource.fields) {
        fieldName = field.split('.').pop();
        if(fieldName != 'WorkItemType') {
            output['workItem' + fieldName] = payload.resource.fields[field];
        } else {
            output['workItemType'] = payload.resource.fields[field];
        }
    }
} else if (payload.eventType == 'workitem.updated') {
    output['workItemId'] = payload.resource.revision.id;
    for (field in payload.resource.revision.fields) {
        fieldName = field.split('.').pop();
        if(fieldName != 'WorkItemType') {
            output['workItem' + fieldName] = payload.resource.revision.fields[field];
        } else {
            output['workItemType'] = payload.resource.revision.fields[field];
        }
    }
} else {
    console.log('ERROR: Unable to load output fields.');
}