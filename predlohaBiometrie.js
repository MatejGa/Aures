let title, takeOver, pin, pinCollection, fileName, building, userNoAccent, signer, serverRelativeUrlToFolder, DocumentTypeId, newName;
const appWebUrl = "/sites/WF/Biometrie"; //TODO: ZMĚNIT NA SLOŽKU
const hostWebUrl = "/sites/WF";

function sendToBiometrics(documentType) {
  title = ""; //TODO: NÁZEV POLOŽKY (IDEÁLNĚ UNIKÁTNÍ - NESMÍ TAM BÝT ZNAKY, CO NEZVLÁDNE URL)
  pin = NWF$("#" + PinVar).val(); //TODO: PIN UŽIVATELE
  pinCollection = pin; //TODO: PIN UŽIVATELE
  fileName = ""; //TODO: NÁZEV SOUBORU (IDEÁLNĚ UNIKÁTNÍ - NESMÍ TAM BÝT ZNAKY, CO NEZVLÁDNE URL)
  signer = "matej.gazda"; //TODO: SPRÁCE, U KOHO SE PODEPISUJE, TAKŽE TŘEBA PAVEL.PALAK
  takeOver = "matej.gazda"; //TODO: HLAVNÍ UŽIVATEL, KTERÝ PODEPISUJE, TAKŽE TŘEBA PAVEL.PALAK
  serverRelativeUrlToFolder = "AppKeyRecordsDoc/NewDocuments"; //TODO: ZMĚNIT NA SLOŽKU PRO APLIKACI, TAKŽE "AppName/NewDocuments"
  DocumentTypeId = documentType //TODO: typ dokumentu, Předávací = 1; Návratový = 2

  const dd = getPdfData();  //TODO: Dole upravit funkci "getPdfData", která vytváří PDF
  const pdfDocGenerator = pdfMake.createPdf(dd);
  pdfDocGenerator.getBuffer().then(function (value) {
    uploadFile(value);
  });
}

function getPdfData() {
  //TODO: V případě potřeby různých formuláře sem dát například switch či jinou podmínkou, generovat pořád vně této funkce
  const dd = {}; //TODO: TVŮJ JSON PRO PDF
  return dd;
}

// Upload the file.
// You can upload files up to 2 GB with the REST API.
function uploadFile(data) {
  newName = fileName;

  // Add the file to the SharePoint folder.
  const addFile = addFileToFolder(data);
  addFile.done(function (file, status, xhr) {
    // Get the list item that corresponds to the uploaded file.
    const getItem = getListItem(file.d.ListItemAllFields.__deferred.uri);
    getItem.done(function (listItem, status, xhr) {
      // Change the display name and title of the list item.
      const changeItem = updateListItem(listItem.d.__metadata);
      changeItem.done(function (data, status, xhr) {
        setTimeout(function() { alert("File sent to biometrics."); }, 1);
      });
      changeItem.fail(onError);
    });
    getItem.fail(onError);
  });
  addFile.fail(onError);

  // Get the local file as an array buffer.
  // function getFileBuffer() {
  //   var deferred = jQuery.Deferred();
  //   var reader = new FileReader();
  //   reader.onloadend = function (e) {
  //     deferred.resolve(e.target.result);
  //   };
  //   reader.onerror = function (e) {
  //     deferred.reject(e.target.error);
  //   };
  //   reader.readAsArrayBuffer(fileInput[0].files[0]);
  //   return deferred.promise();
  // }

  // Add the file to the file collection in the Shared Documents folder.
  function addFileToFolder(arrayBuffer) {
    // Get the file name from the file input control on the page.

    // Construct the endpoint.
    const fileCollectionEndpoint = String.format(
      "{0}/_api/web/getfolderbyserverrelativeurl('{1}')/files" +
        "/add(overwrite=true, url='{2}')",
      appWebUrl,
      serverRelativeUrlToFolder,
      fileName + ".pdf",
      hostWebUrl
    );

    // Send the request and return the response.
    // This call returns the SharePoint file.
    return jQuery.ajax({
      url: fileCollectionEndpoint,
      type: "POST",
      data: arrayBuffer,
      processData: false,
      headers: {
        accept: "application/json;odata=verbose",
        "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
      },
    });
  }

  // Get the list item that corresponds to the file by calling the file's ListItemAllFields property.
  function getListItem(fileListItemUri) {
    // Send the request and return the response.
    const listItemAllFieldsEndpoint = String.format(
      fileListItemUri + "?@target='{1}'",
      appWebUrl,
      hostWebUrl
    );

    return jQuery.ajax({
      url: listItemAllFieldsEndpoint,
      type: "GET",
      headers: { accept: "application/json;odata=verbose" },
    });
  }

  // Change the display name and title of the list item.
  function updateListItem(itemMetadata) {
    const listItemEndpoint = itemMetadata.uri;

    // Define the list item changes. Use the FileLeafRef property to change the display name.
    // For simplicity, also use the name as the title.
    // The example gets the list item type from the item's metadata, but you can also get it from the
    // ListItemEntityTypeFullName property of the list.
    const body = String.format(
      "{{'__metadata':{{'type':'{0}'}},'FileLeafRef':'{1}','Title':'{2}','Signer':'{3}','StatusName':'New','PINCollection':'{4}','DocumentTypeId':'{5}','TakeOver':'{6}'}}",
      itemMetadata.type,
      newName,
      fileName,
      signer,
      pinCollection,
      DocumentTypeId,
      takeOver
    );

    // Send the request and return the promise.
    // This call does not return response content from the server.
    return jQuery.ajax({
      url: listItemEndpoint,
      type: "POST",
      data: body,
      headers: {
        "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
        "content-type": "application/json;odata=verbose",
        "content-length": body.length,
        "IF-MATCH": itemMetadata.etag,
        "X-HTTP-Method": "MERGE",
      },
    });
  }
}

// Display error messages.
function onError(error) {
  alert(error.responseText);
}