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

//Check if event type is an update, because updated work item fields paths are slightly different
if (payload.eventType != 'workitem.updated') {
    output['workItemId'] = payload.resource.id;
    for (field in payload.resource.fields) {
        fieldName = field.split('.').pop();
        output['workItem' + fieldName] = payload.resource.fields[fieldName];
    }
} else if (payload.eventType == 'workitem.updated') {
    output['workItemId'] = payload.resource.revision.id;
    for (field in payload.resource.revision.fields) {
        fieldName = field.split('.').pop();
        output['workItem' + fieldName] = payload.resource.revision.fields[fieldName];
    }
} else {
    console.log('ERROR: Unable to load output fields, because unknown event type.');
}