/**
 * This step can be used to update an Azure DevOps Board work item. It assumes default work item types and fields.
 * Depending on the type of work item there maybe more or less fields or different field name for similar data.
 */
try {
    const endpoint = 'Azure DevOps';
    let conflictRetry = 3;

    let suppressNotifications = 'false';
    if (typeof input['suppressNotifications'] == 'string') {
        suppressNotifications = input['suppressNotifications'].trim().toLowerCase();
        if (suppressNotifications != 'true' && suppressNotifications != 'false') {
            console.log('WARN: suppressNofication set, but invalid value. Must be either true or false.');
            console.log('WARN: Defaulting suppressNotification to false');
            suppressNotifications = 'false';
        }
    }
    const path = '/' + input['organization'].trim() + '/' + input['workItemTeamProject'].trim() + '/_apis/wit/workitems/' + input['workItemId'] + '?suppressNotifications=' + suppressNotifications + '&api-version=5.1';

    console.log('Work Item Type: ' + String(input['workItemType']));
    console.log('INFO: Building work item');

    /**
     * Using this pattern you can add values to other work item fields as well. You will need to determine
     * the path to the field. It seems even if a work item type does not show a field in the UI it still 
     * exists and you can set it. For instance if you set ReproSteps for an issue it will not show in UI, 
     * but then later changes its type to bug the ReproSteps will show in the UI.
     */

    let body = [];

    // These work item attributes take strings for the value
    body = addWorkItemField(input['workItemType'], '/fields/System.WorkItemType', body);
    body = addWorkItemField(input['workItemTitle'], '/fields/System.Title', body);
    body = addWorkItemField(input['workItemPriority'], '/fields/Microsoft.VSTS.Common.Priority', body);
    body = addWorkItemField(input['workItemState'], '/fields/System.State', body);
    body = addWorkItemField(input['workItemReason'], '/fields/System.Reason', body);
    body = addWorkItemField(input['workItemSystem'], '/fields/Microsoft.VSTS.TCM.SystemInfo', body);
    body = addWorkItemField(input['workItemSeverity'], '/fields/Microsoft.VSTS.Common.Severity', body);
    body = addWorkItemField(input['workItemValueArea'], '/fields/Microsoft.VSTS.Common.ValueArea', body);
    body = addWorkItemField(input['workItemReproSteps'], '/fields/Microsoft.VSTS.TCM.ReproSteps', body);
    body = addWorkItemField(input['workItemDescription'], '/fields/System.Description', body);
    body = addWorkItemField(input['workItemRisk'], '/fields/Microsoft.VSTS.Common.Risk', body);
    body = addWorkItemField(input['workItemTags'], '/fields/System.Tags', body);

    // These work item attributes have special formatting for the value
    if (typeof input['parentWorkItemID'] == 'string') {
        if (input['parentWorkItemID'].trim() !== "") {
            let parent = {
                "op": "add",
                "path": "/relations/-",
                "from": null,
                "value": {
                    "rel": "System.LinkTypes.Hierarchy-Reverse",
                    "url": "https://dev.azure.com/" + input['organization'] + "/" + input['workItemTeamProject'] + "/_apis/wit/workItems/" + input['parentWorkItemID'].trim(),
                    "attributes": {
                        "isLocked": false,
                        "name": "Parent"
                    }
                }
            };
            body.push(parent);
        }
    }
    if (typeof input['assigneeDescriptor'] == 'string') {
        if (input['assigneeDescriptor'].trim() !== "") {
            let assignee = {
                "op": "add",
                "path": "/fields/System.AssignedTo",
                "from": null,
                "value": {
                    "descriptor": input['assigneeDescriptor'].trim()
                }
            };
            body.push(assignee);
        }
    }
    
    /** 
     * The request payload body MUST to be serialized into a string.
     * If not the HTTP client will change the content type to application/json
     * and the request will fail
    */
    const bodyString = JSON.stringify(body);

    do {
        if (conflictRetry == 0) {
            throw new Error('Limit reached while retrying conflict failure');
        }
        status = sendRequest(endpoint, path, bodyString);
        conflictRetry -= 1;
    } while (status == 409);
} catch (e) {
    if (input['continueOnError'].toLowerCase().trim() == 'true') {
        console.log("ERROR: Error was dectected, but continuing");
        console.log(e.message);
        output['result'] = 'failed';
    } else {
        throw new Error(e.messasge);
    }
}

function addWorkItemField(stepInput, workItemFieldPath, body) {
    if (typeof stepInput == 'string') {
        const cleanStepInput = stepInput.trim();
        if (cleanStepInput !== '') {
            let type = {
                "op": "add",
                "path": workItemFieldPath,
                "from": null,
                "value": cleanStepInput
            };
            body.push(type);
        }
    }
    return body;
}

function sendRequest(endpoint, path, bodyString) {
    console.log('INFO: Sending update work item request');

    var apiRequest = http.request({
        'endpoint': endpoint,
        'path': path,
        'method': 'PATCH',
        'headers': {
            'Content-Type': 'application/json-patch+json'
        }
    });

    try {
        var apiResponse = apiRequest.write(bodyString);
    } catch (e) {
        throw new Error('Azure DevOps:Issue submitting work item update request. \n' + e.message);
    }

    output['responseCode'] = apiResponse.statusCode;

    if (apiResponse.statusCode === 200) {
        output['result'] = 'succeeded';
        console.log('INFO: Work item creation complete');
        return 200;
    } else if (apiResponse.statusCode === 401) {
        output['result'] = 'failed';
        throw new Error('ERROR:Azure DevOps:Unauthorized.');
    } else if (apiResponse.statusCode === 400) {
        output['result'] = 'failed';
        const response = JSON.parse(apiResponse.body);
        throw new Error('ERROR:Azure DevOps:' + response['message']);
    } else if (apiResponse.statusCode === 404) {
        output['result'] = 'failed';
        const response = JSON.parse(apiResponse.body);
        throw new Error('ERROR:Azure DevOps:' + response['message']);
    } else if (apiResponse.statusCode === 409) {
        console.log("WARN: There was an update conflict.");
        output['result'] = 'failed';
        return 409;
    } else {
        output['result'] = 'failed';
        throw new Error('ERROR:Azure DevOps:Unknown');
    }
}