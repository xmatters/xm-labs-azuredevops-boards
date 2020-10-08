/**
 * This step can be used to add a comment to an Azure DevOps Board work item.
 */
try {
    const endpoint = 'Azure DevOps';
    const path = '/' + input['organization'].trim() + '/' + input['workItemTeamProject'].trim() + '/_apis/wit/workitems/' + input['workItemId'] + '/comments?api-version=5.1-preview.3';
    let conflictRetry = 3;

    const body = {
        "text": input['workItemComment']
    };

    do {
        if (conflictRetry == 0) {
            throw new Error('Limit reached while retrying conflict failure');
        }
        var status = sendRequest(endpoint, path, body);
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

function sendRequest(endpoint, path, body) {
    const apiRequest = http.request({
        'endpoint': endpoint,
        'path': path,
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json-patch+json'
        }
    });

    try {
        var apiResponse = apiRequest.write(body);
    } catch (e) {
        throw ('Azure DevOps:Issue submitting work item add comment request:' + e.message);
    }

    if (apiResponse.statusCode === 200) {
        let payload = JSON.parse(apiResponse.body);
        output['commentId'] = payload.id;
        output['result'] = 'succeeded';
        return 200;
    } else if (apiResponse.statusCode === 401) {
        output['result'] = 'failed';
        throw ('Azure DevOps:Unauthorized');
    } else if (apiResponse.statusCode === 400) {
        output['result'] = 'failed';
        response = JSON.parse(apiResponse.body);
        throw ('Azure DevOps:' + response['message']);
    } else if (apiResponse.statusCode === 404) {
        output['result'] = 'failed';
        response = JSON.parse(apiResponse.body);
        throw ('Azure DevOps:' + response['message']);
    } else if (apiResponse.statusCode === 409) {
        console.log("WARN: There was a conflict sending request.");
        output['result'] = 'failed';
        return 409;
    }
    else {
        output['result'] = 'failed';
        throw ('Azure DevOps:Unknown');
    }
}