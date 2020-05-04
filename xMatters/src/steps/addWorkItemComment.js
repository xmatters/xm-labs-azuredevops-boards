/**
 * This step can be used to add a comment to an Azure DevOps Board work item.
 */

const contentType = "application/json-patch+json";
const path = '/' + input['organization'] + '/' + input['project'] + '/_apis/wit/workitems/' + input['workItemId'] + '/comments?api-version=5.1-preview.3';

var apiRequest = http.request({
    'endpoint': 'Azure DevOps',
    'path': path,
    'method': 'POST',
    'headers': {
        'Content-Type': contentType
    }
});

body = {
    "text": input['comment']
};

try {
    var apiResponse = apiRequest.write(body);
} catch (e) {
    throw ('Azure DevOps:Issue submitting work item add comment request:' + e);
}

output['responseCode'] = apiResponse.statusCode;

if (apiResponse.statusCode === 200) {
    payload = JSON.parse(apiResponse.body);

    output['commentId'] = payload.id;
    output['commentUrl'] = payload.url;
} else if (apiResponse.statusCode === 401) {
    throw ('Azure DevOps:Unauthorized');
} else if (apiResponse.statusCode === 400) {
    response = JSON.parse(apiResponse.body);
    throw ('Azure DevOps:' + response['message']);
} else if (apiResponse.statusCode === 404) {
    response = JSON.parse(apiResponse.body);
    throw ('Azure DevOps:' + response['message']);
} else {
    throw ('Azure DevOps:Unknown');
}