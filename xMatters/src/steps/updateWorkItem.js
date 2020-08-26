/**
 * This step can be used to create an Azure DevOps Board work item. It assumes default work item types and fields.
 * Depending on the type of work item there maybe more or less fields or different field name for similar data.
 */
try {
    const endpoint = 'Azure DevOps';
    const httpMethod = 'PATCH';
    const contentType = "application/json-patch+json";
    const path = '/' + input['organization'].trim() + '/' + input['workItemTeamProject'].trim() + '/_apis/wit/workitems/' + input['workItemId'] + '?suppressNotifications=' + suppressNotifications + '&api-version=5.1';
    var conflictRetry = 3;

    var suppressNotifications = 'false';
    if (input['suppressNotifications'] !== "" && input['suppressNotifications'] !== null && input['suppressNotifications'] !== undefined) {
        suppressNotifications = input['suppressNotifications'].trim().toLowerCase();
        if (suppressNotifications != 'true' && suppressNotifications != 'false') {
            console.log('WARN: suppressNofication set, but invalid value. Must be either true or false.');
            console.log('WARN: Defaulting suppressNotification to false');
            suppressNotifications = 'false';
        }
    }

    var apiRequest = http.request({
        'endpoint': endpoint,
        'path': path,
        'method': httpMethod,
        'headers': {
            'Content-Type': contentType
        }
    });

    console.log('Work Item Type: ' + String(input['workItemType']));
    console.log('INFO: Building work item');

    /**
     * Using this pattern you can add values to other work item fields as well. You will need to determine
     * the path to the field. It seems even if a work item type does not show a field in the UI it still 
     * exists and you can set it. For instance if you set ReproSteps for an issue it will not show in UI, 
     * but then later changes its type to bug the ReproSteps will show in the UI.
     * 
     * If add more fields be sure to include the if statement to check for values passed into the step.
     * If you pass an empty value to Azure DevOps it will clear or set the field to default.
     */
    var body = [];
    if (input['workItemType'] !== "" && input['workItemType'] !== null && input['workItemType'] !== undefined) {
        type = {
            "op": "add",
            "path": "/fields/System.WorkItemType",
            "from": null,
            "value": input['workItemType'].trim()
        };
        body.push(type);
    }
    if (input['workItemTitle'] !== "" && input['workItemTitle'] !== null && input['workItemTitle'] !== undefined) {
        title = {
            "op": "add",
            "path": "/fields/System.Title",
            "from": null,
            "value": input['workItemTitle']
        };
        body.push(title);
    }
    if (input['workItemPriority'] !== "" && input['workItemPriority'] !== null && input['workItemPriority'] !== undefined) {
        priority = {
            "op": "add",
            "path": "/fields/Microsoft.VSTS.Common.Priority",
            "from": null,
            "value": input['workItemPriority']
        };
        body.push(priority);
    }
    if (input['workItemState'] !== "" && input['workItemState'] !== null && input['workItemState'] !== undefined) {
        state = {
            "op": "add",
            "path": "/fields/System.State",
            "from": null,
            "value": input['workItemState'].trim()
        };
        body.push(state);
    }
    if (input['workItemReason'] !== "" && input['workItemReason'] !== null && input['workItemReason'] !== undefined) {
        reason = {
            "op": "add",
            "path": "/fields/System.Reason",
            "from": null,
            "value": input['workItemReason'].trim()
        };
        body.push(reason);
    }
    if (input['workItemSystem'] !== "" && input['workItemSystem'] !== null && input['workItemSystem'] !== undefined) {
        systemInfo = {
            "op": "add",
            "path": "/fields/Microsoft.VSTS.TCM.SystemInfo",
            "from": null,
            "value": input['workItemSystem'].trim()
        };
        body.push(systemInfo);
    }
    if (input['workItemSeverity'] !== "" && input['workItemSeverity'] !== null && input['workItemSeverity'] !== undefined) {
        severity = {
            "op": "add",
            "path": "/fields/Microsoft.VSTS.Common.Severity",
            "from": null,
            "value": input['workItemRisk'].trim()
        };
        body.push(severity);
    }
    if (input['workItemValueArea'] !== "" && input['workItemValueArea'] !== null && input['workItemValueArea'] !== undefined) {
        valueArea = {
            "op": "add",
            "path": "/fields/Microsoft.VSTS.Common.ValueArea",
            "from": null,
            "value": input['workItemValueArea'].trim()
        };
        body.push(valueArea);
    }
    if (input['workItemReproSteps'] !== "" && input['workItemReproSteps'] !== null && input['workItemReproSteps'] !== undefined) {
        reproSteps = {
            "op": "add",
            "path": "/fields/Microsoft.VSTS.TCM.ReproSteps",
            "from": null,
            "value": input['workItemReproSteps']
        };
        body.push(reproSteps);
    }
    if (input['workItemDescription'] !== "" && input['workItemDescription'] !== null && input['workItemDescription'] !== undefined) {
        description = {
            "op": "add",
            "path": "/fields/System.Description",
            "from": null,
            "value": input['workItemDescription']
        };
        body.push(description);
    }
    if (input['workItemRisk'] !== "" && input['workItemRisk'] !== null && input['workItemRisk'] !== undefined) {
        risk = {
            "op": "add",
            "path": "/fields/Microsoft.VSTS.Common.Risk",
            "from": null,
            "value": input['workItemRisk']
        };
        body.push(risk);
    }
    if (input['workItemTags'] !== "" && input['workItemTags'] !== null && input['workItemTags'] !== undefined) {
        risk = {
            "op": "add",
            "path": "/fields/System.Tags",
            "from": null,
            "value": input['workItemTags']
        };
        body.push(risk);
    }
    if (input['parentWorkItemID'] !== "" && input['parentWorkItemID'] !== null && input['parentWorkItemID'] !== undefined) {
        parent = {
            "op": "add",
            "path": "/relations/-",
            "from": null,
            "value": {
                "rel": "System.LinkTypes.Hierarchy-Reverse",
                "url": "https://dev.azure.com/" + input['organization'] + "/" + input['workItemTeamProject'] + "/_apis/wit/workItems/" + input['parentWorkItemID'],
                "attributes": {
                    "isLocked": false,
                    "name": "Parent"
                }
            }
        };
        body.push(parent);
    }
    if (input['assigneeDescriptor'] !== "" && input['assigneeDescriptor'] !== null && input['assigneeDescriptor'] !== undefined) {
        assignee = {
            "op": "add",
            "path": "/fields/System.AssignedTo",
            "from": null,
            "value": {
                "descriptor": input['assigneeDescriptor']
            }
        };
        body.push(assignee);
    }


    bodyString = JSON.stringify(body);

    do {
        if (conflictRetry == 0) {
            throw new Error('Limit reached while retrying conflict failure');
        }
        status = sendRequest(bodyString);
        conflictRetry -= 1;
    } while (status == 409);

    function sendRequest(bodyString) {
        console.log('INFO: Sending update work item request');
        try {
            var apiResponse = apiRequest.write(bodyString);
        } catch (e) {
            throw ('Azure DevOps:Issue submitting work item update request. \n' + e.message);
        }

        output['responseCode'] = apiResponse.statusCode;

        if (apiResponse.statusCode === 200) {
            payload = JSON.parse(apiResponse.body);
            output['result'] = 'succeeded';
            console.log('INFO: Work item creation complete');
            return 200;
        } else if (apiResponse.statusCode === 401) {
            output['result'] = 'failed';
            throw ('ERROR:Azure DevOps:Unauthorized.');
        } else if (apiResponse.statusCode === 400) {
            output['result'] = 'failed';
            response = JSON.parse(apiResponse.body);
            throw ('ERROR:Azure DevOps:' + response['message']);
        } else if (apiResponse.statusCode === 404) {
            output['result'] = 'failed';
            response = JSON.parse(apiResponse.body);
            throw ('ERROR:Azure DevOps:' + response['message']);
        } else if (apiResponse.statusCode === 409) {
            console.log("WARN: There was an update conflict.");
            output['result'] = 'failed';
            return 409;
        } else {
            output['result'] = 'failed';
            throw ('ERROR:Azure DevOps:Unknown');
        }
    }
} catch (e) {
    if (input['continueOnError'].toLowerCase().trim() == 'true') {
        console.log("ERROR: Error was dectected, but continuing");
        console.log(e.message);
        output['result'] = 'failed';
    } else {
        throw new Error(e.messasge);
    }
}