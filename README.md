# Azure DevOps - Boards
This is a closed-loop integration with Azure DevOps Boards. It has a trigger that can be used to start a flow when there is a Work Item event like work item created or updated.  The included steps also allow you to create or update a work item and add comments.

[![Disclamer](https://raw.githubusercontent.com/xmatters/xMatters-Labs/master/media/disclaimer.png)](https://support.xmatters.com/hc/en-us/community/topics)

---
## Pre-Requisites
* Azure DevOps
    * Azure DevOps Services account
    * Permission to setup Service Hooks
    * Permission to setup Personal Access Tokens (You may want a special user account for the integration)
* xMatters
    * Account - if you don't have one [get one](https://www.xmatters.com) for free
    * Permissions to create/edit Workflows

---
## Files
* xMatters
    * [AzureDevOpsBoards.zip](xMatters/workflows/AzureDevOpsBoards.zip) - example workflow
    * [workItemEvent.js](xMatters/src/triggers/workItemEvent.js) - source code for trigger to recieve Work Item events
    * [createWorkItem.js](xMatters/src/steps/createWorkItem.js) - source code for step to create a Work Item
    * [updateWorkItem.js](xMatters/src/steps/updateWorkItem.js) - source code for step to update a Work Item
    * [addWorkItemComment.js](xMatters/src/steps/addWorkItemComment.js) - source code for step to add comments to Work Item

---
## How It Works
For the trigger Service Hooks with in Azure DevOps will send notifications to the Work Item Event trigger in xMatters. This trigger can start a flow with in xMatters than can run any other steps or send send notifications as you like.  It can also utilize the other steps in this integration to manipulate Work Items.

The other steps in the integration can be used to create and update Work Items.  You can also add comments to a work item. These steps have few required values like the organization name, project name, and work item ID(required to update or add comments).  If utilizing the included trigger it will provide this informaiton as outputs.

### :red_circle: WARNING 
Please keep in mind that if you are not careful you can create a loop between Azure DevOps and xMatters.  For example if you have a Service Hook to notify xMatters of a Work Item update that triggers a flow that updates a Work Item.  In these cases the create and update steps have an option called *suppressNotifications".  If this option is set to "true" it will tell Azure DevOps to not send a notification for this particular action. You can also make sure that your flow logic is checking for certain conditions before updating a work item. If set to defaults xMatters will catch floods and suppress them.

---
## Installation
### xMatters - Setup Inbound Trigger
1.  If you do not already have an xMatters user specifically for integrations it is recommended to create one.  This account should only be used for integrations and not need web login permissions. If the account you choose to use for this integration is removed or made inactive then the integration will brake.
2. Under this integration user create a new API key to use with Azure DevOps. *Make sure to note the key and secret for later when we configure Azure DevOps.* [Instructions](https://help.xmatters.com/ondemand/user/apikeys.htm)

    <kbd>
        <img src="media/xm-api-key.png" width="700">
    </kbd>

3. Import the example workflow. [Instructions](https://help.xmatters.com/ondemand/xmodwelcome/workflows/manage-workflows.htm)

    <kbd>
        <img src="media/xm-import-workflow.png" width="700">
    </kbd>

4.  Modify the **Work Item Created** form in the imported workflow and give the integration user sender permissions on the form. [Instructions](https://help.xmatters.com/ondemand/xmodwelcome/communicationplanbuilder/formpermissions.htm)

    <kbd>
        <img src="media/xm-sender-permissions.png" width="700">
    </kbd>

5. Now open the corresponding flow **Work Item Created** and you will see a trigger at the top of the canvas called "**{Workflow Name} - Azure DevOps - Work Item Event**"
6. Hover over the trigger step and select edit.

    <kbd>
        <img src="media/xm-edit-trigger.png" width="700">
    </kbd>

7. On the Settings tab copy the trigger's URL and paste it in your notes for later.

    <kbd>
        <img src="media/xm-edit-trigger2.png" width="700">
    </kbd>

### Azure DevOps - Setup Work Item Notification Subscriptions
We will now set things up on the Azure DevOps side, but we will come back to xMatters and finish up once we get some information from Azure DevOps.

1. Login in to your Azure DevOps organization and go to the project you want to setup the xMatters integration with.
2. Now go to the **Project Settings**
3. In the Project Settings menu select **Service hooks**
4. In the Service Hooks settings select the green + icon to add a new service hook subscription
5. In the subscription setup select **Web Hook** as the type and click Next

    <kbd>
        <img src="media/ado-servicehook-1.png" width="700">
    </kbd>

6. Select **Work item created** as the trigger and set the filters however you like. Once complete click Next.
    
    <kbd>
        <img src="media/ado-servicehook-2.png" width="500">
    </kbd>

7. For the settings we will set the following values and the rest can be left as default.
    * **URL** - this is the URL you copied for the xMatters trigger and saved in your notes.
    * **Basic authentication username** - this will be the xMatters API key you created earlier
    * **Basic authentication password** - this will be the xMatters API key secret you created earlier

    <br>
    <kbd>
        <img src="media/ado-servicehook-3.png" width="500">
    </kbd>

8. Now click Test and it will send a request to xMatters letting you know if it was successful and have a response status code of 202. The xMatters workflow may fail, because the test is using a fake request but as long as the request was successful we are good here. If it failed you can look at the request and response and it could give you a clue as to why it did not succeed, but you may just need to verify
    * You copied the entire URL from the trigger in xMatters
    * The xMatters API key and secret are correct
    * Verify that the xMatters user that owns the API key has send permission on the Flow Form that the xMatters trigger is located.
    * Also make sure the workflow is enabled
    
    <br>
    <kbd>
        <img src="media/ado-servicehook-4.png" width="500">
    </kbd>

    <kbd>
        <img src="media/ado-servicehook-5.png" width="500">
    </kbd>

9. Once it is successful click Finish.
10. You can repeat steps 4 - 9 to setup subscription notifications for other work item actions if you like.
    * Work item updated
    * Work item deleted
    * Work item restored

### Azure DevOps - Setup Credentials for xMatters
To use the Create/Update Work Item and Add Comment steps we need to setup credentials for xMatters to use to connect to Azure DevOps.  
### :large_orange_diamond: WARNING
We will be using a Personal Access Token and as good practice you probably want to use a specific Azure DevOps account for integrations. If you use an actual person's account and it is deactivated or deleted then the integration will break.

1. Login to Azure DevOps as the user you want to create the Personal Access Token under
2. In the top right select the icon with a person with a gear on it.  This will open user settings menu where you will select **Personal access tokens**

    <kbd>
        <img src="media/ado-patsetup-1.png" width="200">
    </kbd>

3. Select **+ New Token** to create a new Personal Access Token

    <kbd>
        <img src="media/ado-patsetup-2.png" width="700">
    </kbd>

4. Set the following values
    * **Name** - Give the token a descriptive name so that you know what it is for like "xMatters"
    * **Organization** - set the Azure DevOps organization you want this token to have access too
        * The user you are creating the token under must have access to the organization for them to show
    * **Expiration** - select **Custom Defined** and set it for the farthest date possible (1 year)

    <br>
    <kbd>
        <img src="media/ado-patsetup-3.png" width="500">
    </kbd>

5. For this integration the token should only need read, write, & manage access to Work Items, but as of writing this I have only tested with Full Access.  If you use the this token to perform other actions from xMatters it may need more permissions.

    <kbd>
        <img src="media/ado-patsetup-4.png" width="500">
    </kbd>

6. Now copy the token that is generated.  Make sure you have a copy because once you close the window you can not see it again.

    <kbd>
        <img src="media/ado-patsetup-5.png" width="500">
    </kbd>

### xMatters - Configure Azure DevOps Endpoint
We will now configure the Endpoint in xMatters so that it can connect to Azure DevOps to create and update work items.  I am still assuming you are using the imported example workflow.  If you are not then you can still follow along, but you will have to create the resources before you can configure them.

1. Open the **Work Item Created** flow in the **Azure DevOps Boards** workflow
2. In the top right open the **Components** menu and select **Endpoints**

    <kbd>
        <img src="media/xm-endpoint-1.png" width="400">
    </kbd>

3. Select the **Azure DevOps** endpoint.
4. We will need to set or verify these basic settings
    * **Name** - I would use "Azure DevOps" because the steps are already set to use this
    * **Base URL** - https://dev.azure.com
    * **Trust self-signed certificates** - disabled

    <br>
    <kbd>
        <img src="media/xm-endpoint-2.png" width="600">
    </kbd>

5. For the endpoint Authentication we need to set the following
    * **Endpoint Type** - Basic
    * **Username** - this will be the Azure DevOps username of the account you created the Personal Access Token
    * **Password** - enter the Personal Access Token
    * **Preemptive** - enabled

    <br>
    <kbd>
        <img src="media/xm-endpoint-3.png" width="600">
    </kbd>

6. Now save the Endpoint configuration

### xMatters - Configure Notifcation Recipients
The recipients in the event notification step in the exmaple workflow need to be set.

1. In the **Work Item Created** flow open the configuration for the **xMatters Create Event - Work Item Created - xMatters Event** step.

    <kbd>
        <img src="media/xm-recipients-1.png" width="700">
    </kbd>

2. In the setup add the xMatters users and/or groups you want to recieve the event notifications to the Recipients field. Click Done when complete.

    <kbd>
        <img src="media/xm-recipients-2.png" width="700">
    </kbd>

3. Save the flow and you are done

---
## Testing
1. Go to Azure DevOps and create a new Work Item
2. The recipients that you configured in the event notification should receive a message on their configured xMatter devices with some basic work item information.
3. If everything is working you should see comments added to the Work Item with notification delivery information
4. The message will have 4 response options
    * **Acknowledge** - will add a comment to the Work Item that responder acknowledge the message
    * **Dismiss** - will add a commit to the Work Item that the responder dismissed the message and will stop notifying them
    * **Create Related Task** - this will create a Task work item and copy some of the information from the original work item
    * **Close Work Item** - this will close the original work item
5. Also, if the responder adds a comment to their response it will be added as a comment to the work item

---
## Troubleshooting
### xMatters Workflow Not Triggering
* Check in xMatters
    * Workflow Configuration
        * Verify that the xMatters user that owns the API key has send permission on the Flow Form that the xMatters trigger is located.
        * Also make sure the workflow is enabled
    * Check for Flow Errors
        * Open the Activity monitor in the xMatters flow and look for any errors
* Check in Azure DevOps
    * Service Hook Configuration
        * Verify you are using the correct xMatters trigger URL and that you entered the entire URL
        * Is the correct xMatters API key and secret
        * If you setup other filters are they filtering out your work item event
            * Example: You set a filter to only send alerts for a particular board and you created the work item in a different board
    

### Work Item is Not Created or Updated
* xMatters
    * Open the Activity monitor in the flow and very there are no errors
    * Make sure the Azure DevOps endpoint is configured correctly
        * Correct URL https://dev.azure.com
        * Using the username of the account that the Personal Access Token was created
        * Personal Access Token was entered correctly
    * Verify the steps that create or update work items are configured with the correct endpoint
* Azure DevOps
    * Verify the Personal Access Token has permissions to created and modify work items
    * Verify the Personal Access Token has not expired
