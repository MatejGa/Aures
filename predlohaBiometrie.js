window.jQuery
  ? "jQuery loaded"
  : import("/_layouts/15/js/aaaauto/jquery.min.js");
window.pdfMake
  ? "PDFmake loaded"
  : import("/_layouts/15/js/aaaauto/pdfMaker/pdfmake.min.js");
import("/_layouts/15/js/aaaauto/pdfMaker/vfs_fonts.min.js");
window.uploadFile
  ? "uploadFile loaded"
  : import("/_layouts/15/js/aaaauto/sendtobiometrics.js").then(
      (m) => (uploadFile = m.default)
    );

function sendToBiometrics(docType) {
  const biometrieData = {
    title: "a", //TODO: NÁZEV POLOŽKY (IDEÁLNĚ UNIKÁTNÍ - NESMÍ TAM BÝT ZNAKY, CO NEZVLÁDNE URL)
    pinCollection: 1, //TODO: PIN UŽIVATELŮ CO TO UVIDÍ
    fileName: "a", //TODO: NÁZEV SOUBORU (IDEÁLNĚ UNIKÁTNÍ - NESMÍ TAM BÝT ZNAKY, CO NEZVLÁDNE URL)
    signer: "matej.gazda", //TODO: SPRÁCE, U KOHO SE PODEPISUJE, TAKŽE TŘEBA PAVEL.PALAK
    takeOver: "matej.gazda", //TODO: HLAVNÍ UŽIVATEL, KTERÝ PODEPISUJE, TAKŽE TŘEBA PAVEL.PALAK
    DocumentTypeId: !!docType ? docType : 1, //TODO: typ dokumentu, Předávací = 1; Návratový = 2
    serverRelativeUrlToFolder: "AppPoolCarDoc/NewDocuments", //TODO: ZMĚNIT NA SLOŽKU PRO APLIKACI, TAKŽE "AppName/NewDocuments"
    itemID: 1,
    isDev: false, // Možnost "true" v případě DEV procesu
  };

  const dd = getPdfData(); //TODO: Dole upravit funkci "getPdfData", která vytváří PDF
  const pdfDocGenerator = pdfMake.createPdf(dd);
  pdfDocGenerator.getBuffer().then(function (value) {
    uploadFile(value, biometrieData);
  });
}

function getPdfData() {
  //TODO: V případě potřeby různých formuláře sem dát například switch či jinou podmínkou, generovat pořád vně této funkce
  const dd = {}; //TODO: TVŮJ JSON PRO PDF
  return dd;
}
