/**
 * The Azure DevOps user descriptor is what is used to do things like assign someone to a work item. 
 * This step is used to find a user's Azure DevOps user descriptor using something like their email
 * address, which is common between their Azure DevOps account and xMatters account. The purpose is
 * to not require syncing user descriptors from Azure DevOps to xMatters.  Microsoft actually 
 * discourages storing user descriptors outside of Azure DevOps, because there are case where it
 * can change.
 */
try {
    const endpoint = 'Azure DevOps - Management';

    if (typeof input['searchTerm'] == 'string') {
        let searchTerm = input['searchTerm'].trim();
        if (searchTerm !== '') {
            console.log('INFO:Searching for user with term "' + searchTerm + '"');
            const response = queryUser(endpoint, input['organization'], searchTerm);

            const user = JSON.parse(response.body);

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

    let URLPath = encodeURI('/' + organization + '/_apis/graph/subjectquery?api-version=6.0-preview.1');

    let apiRequest = http.request({
        'endpoint': endpoint,
        'path': URLPath,
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json'
        }
    });

    let body = {
        "query": searchTerm,
        "subjectKind": ["User"]
    };

    try {
        const apiResponse = apiRequest.write(body);

        if (apiResponse.statusCode != 200) {
            console.log('ERROR:Received bad response during user search');
            console.log('Response Status Code: ' + apiResponse.statusCode);
            throw new Error(apiResponse.body);
        }
        
        return apiResponse;
    } catch (e) {
        console.log('ERROR:Issue finding user');
        throw new Error(e.message);
    }
}