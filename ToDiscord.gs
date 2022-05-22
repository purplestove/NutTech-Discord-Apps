const POST_URL = "WEBHOOK_URL";

function onSubmit(e) {
    const response = e.response.getItemResponses();
    let items = [];

    let sectionsData = [{}];

    var test = e.source.getItems();
    var sectionIdxs = [];
    for (var i = 0; i < test.length;i++){
      var item = test[i];
      var itemType = item.getType();
      var itemIdx = item.getIndex();

      if (itemType == "PAGE_BREAK") {
        sectionIdxs.push(itemIdx);
        sectionsData.push({
          "sectionName": item.getTitle(),
          "sectionItems": []
        });
      }

      var closestLeft = Math.max(...sectionIdxs.filter(v => v < itemIdx));
      if (closestLeft == "-Infinity"){
        var section = 1;
      } else {
        section = closestLeft;
      }
      if (itemType != "PAGE_BREAK"){
        var sec = sectionIdxs.indexOf(section) + 2;

        // Shows the name of the section
        Logger.log("typeItem" + i + ": " + itemType + ", itemTitle: " + item.getTitle() + ", itemId: " + item.getId() + ", itemIdx: " + itemIdx + ", Section: " + sec);

        for (const responseAnswer of response) {
          if (responseAnswer.getItem().getId() != item.getId()) continue;

          Logger.log("response : " + responseAnswer.getResponse());

          const question = responseAnswer.getItem().getTitle();
          const answer = responseAnswer.getResponse();
          let text = "";

          if (!answer) {
            continue;
          }

          if (itemType == "CHECKBOX") {
            let parts = []

            try {
              parts = answer.match(/[\s\S]{1,1024}/g) || [];
            } catch (e) {
              parts = answer;
            }

            for (const [index, part] of Object.entries(parts)) {
              text += "- " + part + "\n";
            }
          } else {
            text = answer;
          }

          sectionsData[sec - 1]["sectionItems"].push({
            "name": question,
            "value": text,
            "inline": false
          });
         
        }

      }
    }

    let embeds = [];

    for (const section of sectionsData) {
        if (section["sectionItems"].length == 0) continue;
        embeds.push({
          "title": section["sectionName"],
          "color": 5606441, // This is optional, you can look for decimal colour codes at https://www.webtoolkitonline.com/hexadecimal-decimal-color-converter.html
          "fields": section["sectionItems"]
        })
    }

    const options = {
        "method": "post",
        "headers": {
            "Content-Type": "application/json",
        },
        "payload": JSON.stringify({
            "content": "‌",
            "embeds": embeds
        })
    };

    UrlFetchApp.fetch(POST_URL, options);
};
