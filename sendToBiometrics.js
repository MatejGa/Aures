// Upload the file.
// You can upload files up to 2 GB with the REST API.
export default async function uploadFile(data, biometrieData) {
  const appWebUrl = `/sites/WF/Biometrie${biometrieData.isDev ? "Dev" : ""}`; //TODO: ZMĚNIT NA SLOŽKU
  const hostWebUrl = "/sites/WF";

  const takeOver = biometrieData.takeOver;
  const pinCollection = biometrieData.pinCollection;
  const fileName = biometrieData.fileName;
  const signer = biometrieData.signer;
  const serverRelativeUrlToFolder = biometrieData.serverRelativeUrlToFolder;
  const DocumentTypeId = biometrieData.DocumentTypeId;
  const itemID = biometrieData.itemID;

  const digest =
    _spPageContextInfo.siteServerRelativeUrl !== hostWebUrl
      ? await getDigest()
      : jQuery("#__REQUESTDIGEST").val();

  // Add the file to the SharePoint folder.
  addFileToFolder(data)
    .then((file) => {
      console.log(file);
      return getListItem(file.d.ListItemAllFields.__deferred.uri);
    })
    .then((listItem) => {
      console.log(listItem);
      return updateListItem(listItem.d.__metadata);
    })
    .then((data) => {
      /*Successfull finish*/
      alert("Protocol has been successfully sent to sign.");
    })
    .catch((err) => {
      console.log("Error: ", err);
      alert("Error: ", err, err.responseText);
    });

  // Add the file to the file collection in the Shared Documents folder.
  async function addFileToFolder(arrayBuffer) {
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
        "X-RequestDigest": digest,
      },
    });
  }

  // Get the list item that corresponds to the file by calling the file's ListItemAllFields property.
  async function getListItem(fileListItemUri) {
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
  async function updateListItem(itemMetadata) {
    console.log(itemMetadata);
    const listItemEndpoint = itemMetadata.uri;

    // Define the list item changes. Use the FileLeafRef property to change the display name.
    // For simplicity, also use the name as the title.
    // The example gets the list item type from the item's metadata, but you can also get it from the
    // ListItemEntityTypeFullName property of the list.
    const body = String.format(
      "{{'__metadata':{{'type':'{0}'}},'FileLeafRef':'{1}','Title':'{2}','Signer':'{3}','StatusName':'New','PINCollection':'{4}','DocumentTypeId':'{5}','TakeOver':'{6}','ExternalID':'{7}'}}",
      itemMetadata.type,
      fileName,
      fileName,
      signer,
      pinCollection,
      DocumentTypeId,
      takeOver,
      itemID
    );

    // Send the request and return the promise.
    // This call does not return response content from the server.
    return jQuery.ajax({
      url: listItemEndpoint,
      type: "POST",
      data: body,
      headers: {
        "X-RequestDigest": digest,
        "content-type": "application/json;odata=verbose",
        "content-length": body.length,
        "IF-MATCH": itemMetadata.etag,
        "X-HTTP-Method": "MERGE",
      },
    });
  }

  // Display error messages.
  function onError(error) {
    alert(error.responseText);
  }

  function getDigest() {
    return $.ajax({
      url: appWebUrl + "/_api/contextinfo",
      type: "POST",
      headers: {
        Accept: "application/json;odata=verbose",
      },
    });
  }
}
