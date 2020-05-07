/**
 * This step can be used to add a comment to an Azure DevOps Board work item.
 */

const contentType = "application/json-patch+json";
const path = '/' + input['organization'].trim() + '/' + input['workItemTeamProject'].trim() + '/_apis/wit/workitems/' + input['workItemId'] + '/comments?api-version=5.1-preview.3';

var apiRequest = http.request({
    'endpoint': 'Azure DevOps',
    'path': path,
    'method': 'POST',
    'headers': {
        'Content-Type': contentType
    }
});

body = {
    "text": input['workItemComment']
};

try {
    var apiResponse = apiRequest.write(body);
} catch (e) {
    throw ('Azure DevOps:Issue submitting work item add comment request:' + e);
}

if (apiResponse.statusCode === 200) {
    payload = JSON.parse(apiResponse.body);

    output['commentId'] = payload.id;
    output['result'] = 'succeeded';
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
} else {
    output['result'] = 'failed';
    throw ('Azure DevOps:Unknown');
}