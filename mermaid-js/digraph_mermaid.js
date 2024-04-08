//名前空間(名前空間用オブジェクト)を作成
var CodeVis = CodeVis || {};

CodeVis.DisplayChart = function(event)
{
    var file = event.target.files[0];

    //入力ファイルが空の場合、処理なし
    if (!file) {
        return false;
    }

    var reader = new FileReader();

    //テキストデータ読み込み完了時処理
    reader.addEventListener("load", () =>
    {
        var wk = reader.result.replace(/.*?(\r\n|\r|\n)/, "graph LR $1");
        var graphTxt = wk.replaceAll(",", "-->");
        var container = document.getElementById("chartContainer");

        //グラフ描画コンテナの初期化(子要素を全削除)
        while(container.firstChild)
        {
            container.removeChild(container.firstChild);
        }

        //グラフテキストを設定
        container.innerHTML = graphTxt;
        console.log(graphTxt);

        // if(mermaid.parse(graphTxt))
        // {
        //     reRender(graphTxt)
        // }

        //-----不具合-----
        //１回目のグラフ描画は、問題なし
        //２回目以降のグラフ描画(再描画)ができない
        //そもそも、mermaid.jsの仕様として可能なのか？

        //グラフ描画(レンダリング)
        mermaid.init();
    
        return true;
    });

    //ローカルファイルをテキストデータとして読込
    reader.readAsText(file, "Shift_JIS");

    alert("ファイルの読み込みが完了しました！");
    console.log("text has read.");
}

document.getElementById("EdgesFile").addEventListener("change", CodeVis.DisplayChart, false);
mermaid.initialize({ startOnLoad: false });
