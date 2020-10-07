/**
 * This is a helper step that can be used to get an xMatters user's email addresses. In the case of
 * this integration it can be used with the Azure DevOps get user descriptor step.
 * 
 * For example when someone replies to a notification you can take their ID and pass it to this step.
 * It will then return the email that then can be passed to the Azure DevOps get user descriptor step
 * as the search term.
 */

var apiRequest = http.request({
    'endpoint': 'xMatters',
    'path': '/api/xm/1/people/' + input['personID'] + "/devices",
    'method': 'GET'
});

var apiResponse = apiRequest.write();
var device_list = "";

output['statusCode'] = apiResponse.statusCode;    

if (apiResponse.statusCode == 200) {

    var response = JSON.parse(apiResponse.body);
  
    for (var dev in response.data) {
                
        if( response.data[dev].deviceType == "EMAIL" && response.data[dev].name == "Work Email"){
            output['Work Email'] = response.data[dev].emailAddress;
        }
        
        if( response.data[dev].deviceType == "EMAIL" && response.data[dev].name == "Home Email"){
            output['Home Email'] = response.data[dev].emailAddress;
        }
        
    }
}