/**
 * This step can be used to create an Azure DevOps Board work item. It assumes default work item types and fields.
 * Depending on the type of work item there maybe more or less fields or different field name for similar data.
 */

const contentType = "application/json-patch+json";
const path = '/' + input['organization'] + '/' + input['project'] + '/_apis/wit/workitems/$' + input['workItemType'] + '?api-version=5.1';

var workItemType = input['workItemType'];

var apiRequest = http.request({
    'endpoint': 'Azure DevOps',
    'path': path,
    'method': 'POST',
    'headers': {
        'Content-Type': contentType
    }
});

console.log('Work Item Type: ' + String(input['workItemType']));
console.log('INFO: Building work item');

var body = [
    {
        "op": "add",
        "path": "/fields/System.Title",
        "from": null,
        "value": input['workItemTitle']
    },
    {
        "op": "add",
        "path": "/fields/Microsoft.VSTS.Common.Priority",
        "from": null,
        "value": input['workItemPriority']
    }
];

//If work item type is a bug then update bug fields else it is any other type update the appropriate fields.
if (String(workItemType).localeCompare('bug', 'en', { sensitivity: 'base' }) === 0) {
    if (input['workItemDescription'] !== "" && input['workItemDescription'] !== null && input['workItemDescription'] !== undefined) {
        //console.log('Repro Steps: ' + String(input['workItemDescription']));
        reproSteps = {
            "op": "add",
            "path": "/fields/Microsoft.VSTS.TCM.ReproSteps",
            "from": null,
            "value": input['workItemDescription']
        };
        body.push(reproSteps);
    }
    if (input['workItemSystem'] !== "" && input['workItemSystem'] !== null && input['workItemSystem'] !== undefined) {
        //console.log('System Info: ' + String(input['workItemSystem']));
        systemInfo = {
            "op": "add",
            "path": "/fields/Microsoft.VSTS.TCM.SystemInfo",
            "from": null,
            "value": input['workItemSystem']
        };
        body.push(systemInfo);
    }

    if (input['workItemRisk'] !== "" && input['workItemRisk'] !== null && input['workItemRisk'] !== undefined) {
        //console.log('Severity: ' + String(input['workItemRisk']));
        severity = {
            "op": "add",
            "path": "/fields/Microsoft.VSTS.Common.Severity",
            "from": null,
            "value": input['workItemRisk']
        };
        body.push(severity);
    }
} else {
    if (input['workItemDescription'] !== "" && input['workItemDescription'] !== null && input['workItemDescription'] !== undefined) {
        //console.log('Description: ' + String(input['workItemDescription']));
        description = {
            "op": "add",
            "path": "/fields/System.Description",
            "from": null,
            "value": input['workItemDescription']
        };
        body.push(description);
    }
}

//If work item is a feature/user story/epic update the appropriate fields
if (String(workItemType).localeCompare('feature', 'en', { sensitivity: 'base' }) === 0 || String(workItemType).localeCompare('user story', 'en', { sensitivity: 'base' }) === 0 || String(workItemType).localeCompare('epic', 'en', { sensitivity: 'base' }) === 0) {
    if (input['workItemRisk'] !== "" && input['workItemRisk'] !== null && input['workItemRisk'] !== undefined) {
        //console.log('Risk: ' + String(input['workItemRisk']));
        risk = {
            "op": "add",
            "path": "/fields/Microsoft.VSTS.Common.Risk",
            "from": null,
            "value": input['workItemRisk']
        };
        body.push(risk);
    }

    if (input['workItemValueArea'] !== "" && input['workItemValueArea'] !== null && input['workItemValueArea'] !== undefined) {
        //console.log('Value Area: ' + String(input['workItemValueArea']));
        valueArea = {
            "op": "add",
            "path": "/fields/Microsoft.VSTS.Common.ValueArea",
            "from": null,
            "value": input['workItemValueArea']
        };
        body.push(valueArea);
    }
}

bodyString = JSON.stringify(body);

console.log('INFO: Sending create work item request');
try {
    var apiResponse = apiRequest.write(bodyString);
} catch (e) {
    throw ('Azure DevOps:Issue submitting work item create request. \n' + e);
}

output['responseCode'] = apiResponse.statusCode;

if (apiResponse.statusCode === 200) {
    payload = JSON.parse(apiResponse.body);

    output['workItemId'] = payload.id;
    output['workItemState'] = payload.fields['System.State'];
    output['workItemUrl'] = payload.url;

    console.log('INFO: Work item creation complete');
} else if (apiResponse.statusCode === 401) {
    throw ('ERROR:Azure DevOps:Unauthorized.');
} else if (apiResponse.statusCode === 400) {
    response = JSON.parse(apiResponse.body);
    throw ('ERROR:Azure DevOps:' + response['message']);
} else if (apiResponse.statusCode === 404) {
    response = JSON.parse(apiResponse.body);
    throw ('ERROR:Azure DevOps:' + response['message']);
} else {
    throw ('ERROR:Azure DevOps:Unknown');
}