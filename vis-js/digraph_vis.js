//名前空間(名前空間用オブジェクト)を作成
var CodeVis = CodeVis || {};

CodeVis.nodes = null;
CodeVis.edges = null;
CodeVis.nodesView = null;
CodeVis.edgesView = null;

// CodeVis.nodesFilterValues = {
//     "config.php": true,
//     "maintenance.php": true,
//     "SystemConfig.php": true,
//     "callback.php": true,
//     "index.php": true,
//     "regist.php": true,
//     "api.php": true,
//     "get_coupon.php": true,
//     "get_point.php": true,
//     "mod_shop.php": true,
//     "new_entry.php": true,
//     "qr_get.php": true,
//     "res.php": true,
//     "select.php": true,
//     "shop_view.php": true,
//     "user_view.php": true,
//     "use_coupon.php": true,
//     "view.php": true,
//     "qr_img.php": true
// };
CodeVis.nodesFilterValues = {};

// CodeVis.edgesFilterValues = {
//     html_href: true,
//     html_refresh: true,
//     html_form: true,
//     php_define: true,
//     php_require: true,
//     php_header: true,
//     php_qrImg: true
// };
CodeVis.edgesFilterValues = {};

CodeVis.nodesFilter = function (node) {
    return CodeVis.nodesFilterValues[node.id];
};

CodeVis.edgesFilter = function(edge)
{
    return CodeVis.edgesFilterValues[edge.relation];
};

CodeVis.ConvertCsvIntoArray = function(event)
{
    var arrayType = event.target.id;
    var file = event.target.files[0];

    //入力ファイルが空の場合、処理なし
    if (!file) {
        return false;
    }

    var reader = new FileReader();

    //テキストデータ読み込み完了時処理
    reader.addEventListener("load", () =>
    {
        var dataPoints = [];

        //読み込んだCSVデータを改行コードで分割
        var dataArray = reader.result.trim().split(/\r\n|\r|\n/);

        //先頭行(ヘッダ)を削除
        dataArray.shift();

        //単一行の分割処理の分岐
        switch (arrayType) {
            case "CanvasJS":
                //連想配列の配列を生成(CanvasJS用)
                dataPoints = dataArray.map(row => {
                    var val = row.split(",");
                    return {
                        x: new Date(parseInt(val[0])),
                        y: parseFloat(val[1])
                    };
                });
                break;
            case "NodesFile":
                var idArray = [];

                //new vis.DataSet()の有無に関わらず、チャート生成は可能
                //連想配列の配列を生成(vis.js[Vis Network]のNode定義用)
                var nodeArray = dataArray.map(row => {
                    var val = row.split(",");
                    idArray.push(val[0]);
                    return {
                        id: val[0],
                        label: val[0]
                    };
                });
                CodeVis.nodes = new vis.DataSet(nodeArray);

                //起点となる要素を作成
                var nodesDivElem = document.createElement("NodesDiv");

                idArray.forEach(lbl =>
                {
                    //Node用フィルタ値を初期化
                    CodeVis.nodesFilterValues[lbl] = true;

                    //<input>要素を作成
                    var inputElem = document.createElement("input");
                    inputElem.setAttribute("type", "checkbox");
                    inputElem.setAttribute("name", "nodesFilter");
                    inputElem.setAttribute("id", lbl);
                    inputElem.setAttribute("value", lbl);
                    inputElem.setAttribute("checked", true);
                    inputElem.addEventListener("change", (chgEv) =>
                    {
                        const { value, checked } = chgEv.target;
                        CodeVis.nodesFilterValues[value] = checked;
                        CodeVis.nodesView.refresh();
                    });

                    //<label>要素を作成
                    var labelElem = document.createElement("label");
                    labelElem.setAttribute("style", "color:black");
                    labelElem.setAttribute("for", lbl);
                    labelElem.innerText = lbl;

                    //起点となる要素に、子要素として<input>と<label>を追加
                    nodesDivElem.append(inputElem, labelElem);
                });

                //空のダミー要素を置換
                document.getElementById("DummyNodesDiv").replaceWith(nodesDivElem);

                CodeVis.nodesView = new vis.DataView(CodeVis.nodes, { filter: CodeVis.nodesFilter });
                break;
            case "EdgesFile":
                var relateArray = [];
                var colorArray = [];

                //new vis.DataSet()の有無に関わらず、チャート生成は可能
                //連想配列の配列を生成(vis.js[Vis Network]のEdge定義用)
                var edgeArray = dataArray.map(row => {
                    var val = row.split(",");
                    relateArray.push(val[2]);
                    colorArray.push(val[3]);
                    return {
                        from: val[0],
                        to: val[1],
                        arrows: "to",
                        relation: val[2],
                        color: { color: val[3] }
                    };
                });
                CodeVis.edges = new vis.DataSet(edgeArray);

                //配列から要素の重複を除外
                relateArray = [...new Set(relateArray)];
                colorArray = [...new Set(colorArray)];

                //起点となる要素を作成
                var edgesDivElem = document.createElement("EdgesDiv");

                relateArray.forEach((relate, i) =>
                {
                    //Edge用フィルタ値を初期化
                    CodeVis.edgesFilterValues[relate] = true;
                    
                    //<input>要素を作成
                    var inputElem = document.createElement("input");
                    inputElem.setAttribute("type", "checkbox");
                    inputElem.setAttribute("name", "edgesFilter");
                    inputElem.setAttribute("id", relate);
                    inputElem.setAttribute("value", relate);
                    inputElem.setAttribute("checked", true);
                    inputElem.addEventListener("change", (chgEv) =>
                    {
                        const { value, checked } = chgEv.target;
                        CodeVis.edgesFilterValues[value] = checked;
                        CodeVis.edgesView.refresh();
                    });

                    //<label>要素を作成
                    var labelElem = document.createElement("label");
                    labelElem.setAttribute("style", "color:" + colorArray[i]);
                    labelElem.setAttribute("for", relate);
                    labelElem.innerText = relate;

                    //起点となる要素に、子要素として<input>と<label>を追加
                    edgesDivElem.append(inputElem, labelElem);
                });

                //空のダミー要素を置換
                document.getElementById("DummyEdgesDiv").replaceWith(edgesDivElem);

                CodeVis.edgesView = new vis.DataView(CodeVis.edges, { filter: CodeVis.edgesFilter });
                break;
            default:
                //通常の2次元配列を生成
                dataPoints = dataArray.map(row => row.split(","));
        }
    });

    //ローカルファイルをテキストデータとして読込
    reader.readAsText(file, "Shift_JIS");

    return true;
}

CodeVis.DisplayChart = function(event)
{
    var container = document.getElementById("chartContainer");
    var visNetData =
    {
        nodes: CodeVis.nodesView,
        edges: CodeVis.edgesView
    };
    var option = {};
    var network = new vis.Network(container, visNetData, option);

    alert("ファイルの読み込みが完了しました！");
    console.log("text has read.");
}

document.getElementById("NodesFile").addEventListener("change", CodeVis.ConvertCsvIntoArray, false);
document.getElementById("EdgesFile").addEventListener("change", CodeVis.ConvertCsvIntoArray, false);
document.getElementById("ExeChart").addEventListener("click", CodeVis.DisplayChart, false);
// document.getElementsByName("nodesFilter").forEach((filter) =>
// {
//     filter.addEventListener("change", (event) => {
//         const { value, checked } = event.target;
//         CodeVis.nodesFilterValues[value] = checked;
//         CodeVis.nodesView.refresh();
//     })
// });
// document.getElementsByName("edgesFilter").forEach((filter) =>
// {
//     filter.addEventListener("change", (event) =>
//     {
//         const { value, checked } = event.target;
//         CodeVis.edgesFilterValues[value] = checked;
//         CodeVis.edgesView.refresh();
//     })
// });
