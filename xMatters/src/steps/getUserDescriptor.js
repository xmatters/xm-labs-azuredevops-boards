try {
    const organization = input['organization'];
    const searchTerm = input['searchTerm'];
    const endpoint = 'Azure DevOps - Management';

    console.log('INFO:Searching for user with term "' + searchTerm + '"');

    if (searchTerm !== null && searchTerm != "" && searchTerm !== undefined) {
        var response = queryUser(endpoint, organization, searchTerm);

        var user = JSON.parse(response.body);

        if (user.count == 1) {
            output['descriptor'] = user.value[0].descriptor;
            output['displayName'] = user.value[0].displayName;
        } else if (user.count > 1) {
            throw new Error('More than one user matches term ' + searchTerm);
        } else if (user.count == 0) {
            throw new Error('No user matching term ' + searchTerm);
        } else {
            throw new Error('Unknown Error');
        }
    } else {
        throw new Error('Must provide a search term');
    }
} catch (e) {
    if (input['continueOnError'].toLowerCase().trim() == 'true') {
        console.log("ERROR: Error was dectected, but continuing flow");
        console.log(e.message);
        output['descriptor'] = 'failed';
        output['displayName'] = 'failed';
    } else {
        throw new Error(e.messasge);
    }
}

function queryUser(endpoint, organization, searchTerm) {
    console.log('INFO:Searching for user');
    var apiRequest = null;
    var apiResponse = null;
    var body = null;

    try {
        var URLPath = encodeURI('/' + organization + '/_apis/graph/subjectquery?api-version=6.0-preview.1');

        apiRequest = http.request({
            'endpoint': endpoint,
            'path': URLPath,
            'method': 'POST',
            'headers': {
                'Content-Type': 'application/json'
            }
        });

        body = {
            "query": searchTerm,
            "subjectKind": ["User"]
        };
    } catch (e) {
        console.log('ERROR:Issue setting up query');
        throw e.message;
    }

    try {
        apiResponse = apiRequest.write(body);

        if (apiResponse.statusCode != 200) {
            console.log('ERROR:Received bad response during user search');
            console.log('Response Status Code: ' + apiResponse.statusCode);
            throw apiResponse.body;
        }
    } catch (e) {
        console.log('ERROR:Issue finding user');
        throw e.message;
    }

    return apiResponse;
}
