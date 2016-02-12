'use strict';




/***********************************************
                   
                 Add URL
*************************************************/

var Zap = {
    add_url_pre_write: function(bundle) {
        
        var body = 
            { 
              "Name":bundle.action_fields_full.name, 
              "Description": "\"" + bundle.action_fields_full.description + "\"",
              "Uri": bundle.action_fields_full.url
              
             };
             bundle.request.data = JSON.stringify(body);
        return bundle.request;
     
    },

    

/***********************************************
                   
                 Add Note 
*************************************************/


    add_note_pre_write: function(bundle) {
          var body = 
            { 
              "Name":bundle.action_fields_full.Name, 
              "Description": bundle.action_fields_full.Description
             };
             bundle.request.data = JSON.stringify(body);
        return bundle.request;
    },





/***********************************************
                   Move Item
*************************************************/
    
    move_item_pre_write: function(bundle) {
        
        bundle.request.method = "PATCH";
        
        var newFolder = bundle.action_fields_full.selectDir;
        
        
        var body = {  "Parent": { "Id": newFolder } };
        bundle.request.data = JSON.stringify(body);
        return bundle.request;
    },


    move_item_post_write: function(bundle) {
        return bundle.request;
    },
    
    
/***********************************************
                   Create User
*************************************************/

 
    create_user_pre_write: function(bundle) {
    //build post body
    console.log(bundle.auth_fields.domain);
    console.log("https://" +bundle.auth_fields.domain+ ".sf-api.com/sf/v3/Zones");
    
    var send = {
              'method': 'GET',
              'url':"https://" +bundle.auth_fields.domain+ ".sf-api.com/sf/v3/Zones",
              
              'headers': { 

                "Authorization": "Bearer "+bundle.auth_fields.access_token
              }
        };
    
    var response = z.request(send);
    console.log(response);
    var content = response.content;
    var data = JSON.parse(content);

    var zone = data.value[0].Id;

  
    
    var post = {};
    post.Email = bundle.action_fields_full.Email;
    post.FirstName = bundle.action_fields_full.FirstName;
    post.LastName = bundle.action_fields_full.LastName;
    if(bundle.action_fields_full.Company && bundle.action_fields_full.Company !== "" && bundle.action_fields_full.Company !== null)
        {
            post.Company = bundle.action_fields_full.Company;
        }
        
    post.Password = bundle.action_fields_full.Password;
    post.Preferences = {
    
    "CanResetPassword":bundle.action_fields_full.CanResetPassword,
    "CanViewMySettings":bundle.action_fields_full.CanViewMySettings
    
    };
    post.DefaultZone = {"Id":zone};
    //Set post body as built post
    bundle.request.data = JSON.stringify(post);
    
        return bundle.request;
    },



    copy_item_pre_write: function(bundle) {
        //for logs
         return bundle;
    },
   

/***********************************************
  Folder for Item Dynamic Dropdown {selectFolder}
*************************************************/
//used when multiple dynamic dropdowns are needed for folders in the same action or trigger

    folder_for_item_post_poll: function(bundle) {
    
      var results = JSON.parse(bundle.response.content);
   var myArray=[];
   //for each returned object in array value
   results.value.forEach( function (object)
{
    var dataType = object["odata.type"];
    //Check to see if file type is folder
    if(dataType.indexOf("Folder") !== -1){
    //if folder capture name and id send to obect
    var cat = {};
        cat.Name = object.Name;
        cat.Id = object.Id;
        //build array of new objects containing only folder names and id
        myArray.push(cat);
    }
   
});
    // Create list item with value of home to allow users to return to the home directory when selecting file from dropdown.
     var home = {};
    home.Name = "Home";
    home.Id = "home";
    myArray.push(home);
    bundle.response.content =myArray;
    myArray={"Value":myArray};
    return bundle.response;
        
        
    },
    
    
/***********************************************
                List Items 
*************************************************/
//Used when you need to select items from the folder in selectDir 
//Edit returned items to retun item Name and Id
    items_post_poll: function(bundle) {
       var results = JSON.parse(bundle.response.content);
   var myArray=[];
   //for each returned object in array value
   results.value.forEach( function (object)
{
    
   
    var cat = {};
        cat.Name = object.Name;
        cat.Id = object.Id;
        //build array of new objects containing only item names and id
        myArray.push(cat);
    
   
});
   
    bundle.response.content =myArray;
    myArray={"Value":myArray};
    return bundle.response;
        
    },







/***********************************************
               Upload File
*************************************************/

 upload_file_pre_write: function(bundle) {
 
     var folder = bundle.action_fields_full.selectDir;
     //if folder is home error will occure if Id not used dynamic dropdown strting at top will work.

     console.log(bundle.auth_fields.domain);
     console.log(bundle.action_fields_raw.selectDir);
     console.log(folder);
 
 
 
   //Send first request to prepare for uplod and generate response chunk uri
   var payload = {
       "Method":"standard", 
       "Raw": false, 
       "FileName":bundle.request.files.Filedata[0],
       "Unzip":false
       };
        var request = {
              'method': 'POST',
              'url':"https://"+bundle.auth_fields.domain+".sf-api.com/sf/v3/Items("+bundle.action_fields_full.selectDir+")/Upload2",
              'headers': {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': "Bearer "+bundle.auth_fields.access_token
              },
              'data':  JSON.stringify(payload)
        };
        
    var response = z.request(request);
    var content = response.content;
    var data = JSON.parse(content);
   //Update request url to the response upload chunk uri
    bundle.request.url = data.ChunkUri;
    
    //Update data to the upload file from form.

    //Update header content
    bundle.request.headers["Content-Type"] = "multipart/form-data";
       
   return bundle.request;
     },
 
 
  upload_file_post_write: function(bundle) {
    //for logs
        return bundle;
    },
/***********************************************
               Create Folder
*************************************************/
    create_folder_pre_write: function(bundle) {
    
    //Set data to build object that is formated to correct post
    bundle.request.data = JSON.stringify(
        {
    
        "Name":bundle.action_fields_full.Name,
        "Description":bundle.action_fields_full.Description
     
         }
     );
     
    return bundle.request;
    
    },
    
    
   
/***********************************************
  Folder Dynaimic Drropdown Trigger {{selectDir}}
*************************************************/

    folders_post_poll: function(bundle) {
       var results = JSON.parse(bundle.response.content);
       var myArray=[];
       //for each returned object in array value
       results.value.forEach( function (object)
       {
            var dataType = object["odata.type"];
            //Check to see if file type is folder
            if(dataType.indexOf("Folder") !== -1){
            //if folder capture name and id send to obect
            var cat = {};
                cat.Name = object.Name;
                cat.Id = object.Id;
                //build array of new objects containing only folder names and id
                myArray.push(cat);
        }

    });

        // Create list item with value of home to allow users to return to the home directory when selecting file from dropdown.
         var top = {};
        top.Name = "Top";
        top.Id = "top";
        myArray.push(top);
        bundle.response.content =myArray;
        myArray={"Value":myArray};
        return bundle.response;


        },


/***********************************************
         Trigger Shares (not visable)
*************************************************/


  // This returns a download content link for downloading file to other service. In this case it returns when a new share is made. Can be resued to modify any trigger we want to download items from
    trigger_shares_post_poll: function(bundle) {
        if (!bundle.response.content) {
        
            return [];
            
        }

        var stuff = JSON.parse(bundle.response.content);
        // Testing
        console.log(stuff.value[0].Id);
        console.log('https://'+bundle.auth_fields.domain+'.sf-api.com/sf/v3/Shares('+stuff.value[0].Id+')/Items');
        console.log("Authorization"+" Bearer "+bundle.auth_fields.access_token);


        //Get share Id of returned new item 
        var shareId = stuff.value[0].Id;
       
        // 
        var getId = {
        
          'method': 'GET',
          'url': 'https://'+bundle.auth_fields.domain+'.sf-api.com/sf/v3/Shares('+shareId+')/Items',
          
          'headers': {
             "Content-Type": "application/json; charset=utf-8", 
             "Accept": "application/json", 
             "Authorization": "Bearer "+bundle.auth_fields.access_token
          }
         };
         
       //parse response
       var Response = z.request(getId);
       var getIdResponse = JSON.parse(Response.content);
       
      //get item Id from returned response 
      var item = getIdResponse.value[0].Id;
      
      console.log(item); 



     //Get download content url from citrix using item id we can resuse this for downloading item from home folder once in chronological.
       var request = {
              'method': 'GET',
              'url': 'https://'+bundle.auth_fields.domain+'.sf-api.com/sf/v3/Items('+item+')/Download?includeallversions=false&redirect=false',
              
              'headers': {
                 "Content-Type": "application/json; charset=utf-8", 
                 "Accept": "application/json", 
                 "Authorization": "Bearer "+bundle.auth_fields.access_token
              }
             };

       var rResponse = z.request(request);
       var DD = JSON.parse(rResponse.content);
       //set content equal to downlad url. 
       var value = {"File":DD.DownloadUrl,
                    "Name":getIdResponse.value[0].FileName,
                    "Id":shareId,
                    "Size":getIdResponse.value[0].FileSizeInKB+"KB"
                                       };
       //return download url to be used in zap.
       return [value];

           
    },
    
    
    
 /***********************************************
                    New File
*************************************************/

//function to be called in new file with z.dehydrate
  get_download_link: function(bundle){
        var request = {
              'method': 'GET',
              'url': 'https://'+bundle.auth_fields.domain+'.sf-api.com/sf/v3/Items('+bundle.item_Id+')/Download?includeallversions=false&redirect=false',
              
              'headers': {
                 "Content-Type": "application/json; charset=utf-8", 
                 "Accept": "application/json", 
                 "Authorization": "Bearer "+bundle.auth_fields.access_token
              }
             };
             
       var Response = z.request(request);
       var content = JSON.parse(Response.content);
      var dLink = content.DownloadUrl;
      
       
       //set file as returned download link
       return dLink;
       
      
    
    },
    
    
    // new file in folder
    new_file_post_poll: function(bundle) {
        
      var content = JSON.parse(bundle.response.content);
      var items = content.value;
      var myArray=[];
        items.forEach( function (item)
       {
           
           //create object for each returned item in folder  
            var fileInfo = {};
                
                fileInfo.File = z.dehydrate('get_download_link', {item_Id: item.Id});
                fileInfo.Name = item.Name;
                fileInfo.Id = item.Id;
                fileInfo.Size =item.FileSizeInKB+"KB";
                fileInfo.Date = item.CreationDate;
                myArray.push(fileInfo);
        });
        
        return myArray;
        
    },

    
    
    
/***********************************************
      New Share Teturn Id (not in use)
*************************************************/
    // Return item id of most recent share as insted of share Id 
    new_share_Id_post_poll: function(bundle) {
    
        var stuff = JSON.parse(bundle.response.content);
       
        console.log(stuff.value[0].Id);
        console.log('https://'+bundle.auth_fields.domain+'.sf-api.com/sf/v3/Shares('+stuff.value[0].Id+')/Items');
        console.log("Authorization"+" Bearer "+bundle.auth_fields.access_token);
        
        
        //Get share Id of returned new item 
        var shareId = stuff.value[0].Id;
        // 
        var getId = {
          'method': 'GET',
          'url': 'https://'+bundle.auth_fields.domain+'.sf-api.com/sf/v3/Shares('+shareId+')/Items',
          'headers': {
             "Content-Type": "application/json; charset=utf-8", 
             "Accept": "application/json", 
             "Authorization": "Bearer "+bundle.auth_fields.access_token
          }
         };
         
     //parse response
     var Response = z.request(getId);
     var getIdResponse = JSON.parse(Response.content);
       
     //get item Id from returned response 
     var item = getIdResponse.value[0].Id;
     //set retun to item name and Id
     
     var items = {
     
      "Name":getIdResponse.value[0].Name,
      "Id":getIdResponse.value[0].Id  
      
      };
      
      return [items];
    },




/***********************************************
               Test Poll
*************************************************/
    test_post_poll: function(bundle) {
        var stuff = bundle.response.content;
        if (stuff) {
            return [ { email: stuff }];
        }
        else { 
            return [];
        }
    }
    
};