/*
        Ffau - A blocky-based editor for teaching HTML, CSS and Javascript.

				Developed by Pal Kerecsenyi, Geza Kerecsenyi and Oli Plant.
				Full details are avaliable at the Github repo: https://github.com/codeddraig/ffau
				Ffau editor will not work without its libraries. The best way to get all
					off this data at once is to grab the latest release version from the
					Github repo or to install via NPM.
				Ffau is open source software. This means you can re-mix, share and use
					it however you want, including for commercial purposes. However, you
					MUST provide attribution to the original authors if you do this.
				However, Ffau is provided with NO WARRANTY whatsoever, and by using this
					software, you agree to the terms of the MIT License.

				Copyright (c) 2017-19 The CodeDdraig Organisation

				THIS IS VERSION 1.0.0
*/

function fullEscape(input){
    return escape(input)
        .replace(/%25/g, "%");
}

function looseEscape(input) {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function CSSEscape(input) {
    return input
        .replace(/;/g, "")
        .replace(/{/g, "")
        .replace(/}/g, "")
        .replace(/</g, "")
        .replace(/:/g, "")
}

var URLRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
var hashRegex = /#([A-z0-9]*)/;

function isNewTabUrl(input) {
    return URLRegex.test(input) || (!input.includes('http://') && !input.includes('https://')) && !hashRegex.test(input) && input.length > 0;
}

/**
 * @return {string}
 */
function URLInput(input){
    input = encodeURI(input);

    if(URLRegex.test(input) || hashRegex.test(input)){
        return input;
    } else if (isNewTabUrl(input)) {
        return 'https://' + input;
    }
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

var htmlGen = new Blockly.Generator('HTML');

htmlGen.init = function(workspace) {};
htmlGen.finish = function(code) {return code;};

htmlGen.scrub_ = function(block, code) {
    var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    var nextCode = htmlGen.blockToCode(nextBlock);
    return code + nextCode;
};

htmlGen['html'] = function(block) {
    var statements_content = htmlGen.statementToCode(block, 'content');
    var code = '<!DOCTYPE html>\n<html>\n' + statements_content + '</html>\n';
    return code;
};

htmlGen['head'] = function(block) {
    var statements_content = htmlGen.statementToCode(block, 'content');
    var code = '<head>\n' + statements_content + '</head>\n';
    return code;
};

htmlGen['metacharset'] = function(block) {
    var value = block.getFieldValue('value');
    var code = '<meta charset="'+value+'">\n';
    return code;
};

htmlGen['metaviewport'] = function(block) {
    var code = '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    return code;
};

htmlGen['title'] = function(block) {
    var value = block.getFieldValue('value');
    var code = `<title>${ looseEscape(value) }</title>\n`;
    return code;
};

htmlGen['body'] = function(block) {
    var statements_content = htmlGen.statementToCode(block, 'content');
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC).trim();
    var code = '<body'+(block_modifier ? " " + block_modifier.trim() : "")+'>\n' + statements_content + '</body>\n';
    return code;
};

htmlGen['headertag'] = function(block) {
    var statements_content = htmlGen.statementToCode(block, 'content');
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    var code = '<header'+(block_modifier ? " " + block_modifier.trim() : "")+'>\n' + statements_content + '</header>\n';
    return code;
};

htmlGen['footertag'] = function(block) {
    var statements_content = htmlGen.statementToCode(block, 'content');
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    var code = '<footer'+(block_modifier ? " " + block_modifier.trim() : "")+'>\n' + statements_content + '</footer>\n';
    return code;
};

htmlGen['divider'] = function(block) {
    var statements_content = htmlGen.statementToCode(block, 'content');
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    var code = '<div'+(block_modifier ? " " + block_modifier.trim() : "")+'>\n' + statements_content + '</div>\n';
    return code;
};

htmlGen['linebreak'] = function(block){
    return "<br/>\n";
};

htmlGen['hline'] = function(block){
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    return "<hr" + (block_modifier ? " " + block_modifier.trim() : "") + "/>\n";
};

htmlGen['style'] = function(block){
    var statement = htmlGen.statementToCode(block, 'content');
    return '<style>\n' + statement + '</style>\n';
};

htmlGen['stylearg'] = function(block){
    var statement = htmlGen.statementToCode(block, 'content').trim();
    return 'style="' + statement + '" ';
};

htmlGen['cssitem'] = function(block){
    var stmt = htmlGen.statementToCode(block, 'content');
    var mod = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    mod = mod.split(' ').join(''); // remove spaces

    var selector = CSSEscape(block.getFieldValue('selector'));

    return selector + mod + '{\n' + stmt + '}\n';
};

htmlGen['cssevents'] = function(block){
    var stmt = block.getFieldValue('content');
    var mod = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    var code = ':'+stmt+mod;
    return code;
};

htmlGen['cssnot'] = function(block){
    var value = block.getFieldValue('content');
    var mod = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    var code = ':not(' + CSSEscape(value) + ')' + mod;
    return code;
};

htmlGen['fontfamily'] = function(block){
    var value = block.getFieldValue('value');
    return 'font-family: ' + fullEscape(value) + ';\n';
};

htmlGen['fontsize'] = function(block){
    var value = block.getFieldValue('value');
    return 'font-size: ' + fullEscape(value) + ';\n';
};

htmlGen['fontweight'] = function(block) {
    var weight = block.getFieldValue('weight');
    return `font-weight: ${weight};\n`;
};

htmlGen['textshadow'] = function(block){
    var x = fullEscape(block.getFieldValue('xoffset'));
    var y = fullEscape(block.getFieldValue('yoffset'));
    var b = fullEscape(block.getFieldValue('blur'));
    var c = block.getFieldValue('color');

    return `text-shadow: ${x} ${y} ${b} ${c};\n`;
};

htmlGen['boxshadow'] = function(block) {
    var x = fullEscape(block.getFieldValue('x-offset'));
    var y = fullEscape(block.getFieldValue('y-offset'));
    var blur = fullEscape(block.getFieldValue('blur'));

    var color = block.getFieldValue('color');

    return `box-shadow: ${x} ${y} ${blur} ${color};\n`;
};

htmlGen['texttransform'] = function(block){
    var value = block.getFieldValue('value');
    return `text-transform: ${value};\n`;
};

htmlGen['textalign'] = function(block){
    var value = block.getFieldValue('value');
    return `text-align: ${value};\n`;
};

htmlGen['letterspacing'] = function(block){
    var value = block.getFieldValue('value');
    return `letter-spacing: ${ fullEscape(value) };\n`;
};

htmlGen['margin'] = function(block){
    var direction = block.getFieldValue('direction');
    var value = block.getFieldValue('value');
    return 'margin-' + direction + ': ' + fullEscape(value) + ';\n';
};

htmlGen['padding'] = function(block){
    var direction = block.getFieldValue('direction');
    var value = block.getFieldValue('value');
    return 'padding-' + direction + ': ' + fullEscape(value) + ';\n';
};

htmlGen['display'] = function(block){
    var value = block.getFieldValue('content');
    return 'display: ' + value + ';\n';
};

htmlGen['overflow'] = function(block){
    var value = block.getFieldValue('content');
    var direction = block.getFieldValue('direction');

    return `overflow-${direction}: ${value};\n`;
};

htmlGen['color'] = function(block){
    var color = block.getFieldValue('value');
    return 'color: ' + color + ';\n';
};

htmlGen['colordropdown'] = function(block) {
    var color = block.getFieldValue('color');
    return `color: ${color};\n`;
};

htmlGen['linkhead'] = function(block){
    var library = block.getFieldValue('library');

    var code;
    if(library==="bootstrap"){
        code = '<link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.3/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-Zug+QiDoJOrZ5t4lssLdxGhVrurbmBWopoEl+M6BdEfwnCJZtKxi1KgxUyJq13dy" crossorigin="anonymous">\n';
    }else if(library==="materialize"){
        code = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.2/css/materialize.min.css">\n';
    }else if (library==="magic"){
        code = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/magical-css@latest/dist/magic.css">\n';
    }

    return code;
};

htmlGen['bgcolor'] = function(block){
    var color = block.getFieldValue('value');
    return 'background-color: ' + color + ';\n';
};

htmlGen['bgimage'] = function(block){
    var content = block.getFieldValue('content');
    return 'background-image: url("' + URLInput(content) + '");\n';
};

htmlGen['bgposition'] = function(block){
    var content = block.getFieldValue('content');
    return 'background-position: ' + content + ';\n';
};

htmlGen['bgrepeat'] = function(block){
    var content = block.getFieldValue('content');
    var code = 'background-repeat: ' + content + ';\n';
    return code;
};

htmlGen['bgsize'] = function(block){
    var content = block.getFieldValue('content');
    var code = 'background-size: ' + fullEscape(content) + ';\n';
    return code;
};

htmlGen['border'] = function(block){
    var width = fullEscape(block.getFieldValue('width'));
    var type =  block.getFieldValue('type');
    var color = block.getFieldValue('color');

    return 'border: ' + width + 'px ' + type + ' ' + color + ';\n';
};

htmlGen['borderedge'] = function(block) {
    var edge = block.getFieldValue('edge');
    var width = fullEscape(block.getFieldValue('width'));
    var type =  block.getFieldValue('type');
    var color = block.getFieldValue('color');

    return `border-${edge}: ${width}px ${type} ${color};\n`;
};

htmlGen['borderrad'] = function(block){
    var content = block.getFieldValue('content');
    return 'border-radius: ' + fullEscape(content) + ';\n';
};

htmlGen['cursor'] = function(block){
    var content = block.getFieldValue('content');
    return 'cursor: ' + content + ';\n';
};

htmlGen['bordercol'] = function(block){
    var collapse = block.getFieldValue('value');

    var code;
    if(collapse==="TRUE"){
        code = 'border-collapse: collapse;\n';
    }else{
        code = 'border-collapse: separate;\n';
    }

    return code;
};

htmlGen['widthheightnum'] = function(block){
    var option = block.getFieldValue('option');
    var size = block.getFieldValue('size');

    return option + ': ' + fullEscape(size) + ';\n';
};

htmlGen['widthheight'] = function(block){
    var option = block.getFieldValue('option');
    var value = block.getFieldValue('value');

    return option + ': ' + value + ';\n';
};

htmlGen['float'] = function(block) {
    return 'float: ' + block.getFieldValue('content') + ';\n';
};

htmlGen['verticalalign'] = function(block) {
    var align = block.getFieldValue('align');

    return `vertical-align: ${align};\n`;
};

htmlGen['transition'] = function(block) {
    var property = fullEscape(block.getFieldValue('transition-property'));
    var duration = fullEscape(block.getFieldValue('duration'));
    var delay = fullEscape(block.getFieldValue('delay'));
    var timing = htmlGen.statementToCode(block, 'timing-function', htmlGen.ORDER_ATOMIC);

    return `transition-property: ${property};\ntransition-duration: ${duration};\ntransition-delay: ${delay};\ntransition-timing-function: ${timing};\n`;
};

htmlGen['transitiontimingdropdown'] = function(block) {
    return block.getFieldValue('function');
};

htmlGen['transitiontimingbezier'] = function(block) {
    var bez1 = fullEscape(block.getFieldValue('bez1'));
    var bez2 = fullEscape(block.getFieldValue('bez2'));
    var bez3 = fullEscape(block.getFieldValue('bez3'));
    var bez4 = fullEscape(block.getFieldValue('bez4'));

    return `cubic-bezier(${bez1}, ${bez2}, ${bez3}, ${bez4})`;
};

htmlGen['othercss'] = function(block){
    var property = fullEscape(block.getFieldValue('property'));

    var value = fullEscape(block.getFieldValue('value'))
        .replace(/%20/g, " ")
        .replace(/%28/g, "(")
        .replace(/%29/g, ")");

    var code = property + ': ' + value + ';\n';
    return code;
};

htmlGen['args'] = function(block) {
    var code = htmlGen.statementToCode(block, 'content').trim();
    return code;
};

htmlGen['class'] = function(block) {
    var text_content = block.getFieldValue('content');
    return 'class="' + looseEscape(text_content) + '" ';
};

htmlGen['id'] = function(block) {
    var text_content = block.getFieldValue('content');
    return 'id="' + looseEscape(text_content) + '" ';
};

htmlGen['align'] = function(block) {
    return 'align="' + block.getFieldValue('content') + '" ';
};

htmlGen['emptyarg'] = function(block) {
    var property = block.getFieldValue('property');
    var value = block.getFieldValue('value');
    return fullEscape(property) + '="' + looseEscape(value) + '" ';
};

htmlGen['emptytext'] = function(block) {
    var text_content = block.getFieldValue('content');
    return '\n' + looseEscape(text_content) + '\n';
};

htmlGen['paragraph'] = function(block) {
    var statements_content = htmlGen.statementToCode(block, 'content');
    var block_modifier = htmlGen.statementToCode(block, 'modifier');
    return '<p' + (block_modifier ? " " + block_modifier.trim() : "") + '>' + statements_content + '</p>\n';
};

htmlGen['header'] = function(block) {
    var statements_content = htmlGen.statementToCode(block, 'content');
    var header_size = block.getFieldValue("size");
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC).trim();
    return '<h' + (header_size + ' ' + block_modifier).trim() + '>' + statements_content + '</h' + header_size + '>\n';
};

htmlGen['textmod'] = function(block){
    var content = htmlGen.statementToCode(block,'content');
    var type = block.getFieldValue("type");
    return '\n<' + type + '>' + content + '</' + type + '>\n';
};

htmlGen['span'] = function(block){
    var content = htmlGen.statementToCode(block,'content');
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    return '<span' + (block_modifier ? " " + block_modifier.trim() : "") + '>' + content + '</span>';
};

htmlGen['link'] = function(block){
    var text = htmlGen.statementToCode(block, 'content');
    var bareLink = block.getFieldValue('target');
    var link = URLInput(block.getFieldValue('target'));
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    var target = '';

    if(isNewTabUrl(bareLink)) {
        target = ' target="_blank"';
    }

    return '<a href="' + link + '"' + target + (block_modifier ? " " + block_modifier.trim() : "") + '>' + text + '</a>\n';
};

htmlGen['table'] = function(block){
    var content = htmlGen.statementToCode(block, 'content');
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    return '<table' + (block_modifier ? " " + block_modifier.trim() : "") + '>\n' + content + '</table>\n';
};

htmlGen['tablerow'] = function(block){
    var content = htmlGen.statementToCode(block, 'content');
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    return '<tr' + (block_modifier ? " " + block_modifier.trim() : "") + '>\n' + content + '</tr>\n';
};

htmlGen['tableheading'] = function(block){
    var content = htmlGen.statementToCode(block, 'content');
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    return '<th' + (block_modifier ? " " + block_modifier.trim() : "") + '>\n' + content + '</th>\n';
};

htmlGen['tabledata'] = function(block){
    var content = htmlGen.statementToCode(block, 'content');
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    return '<td' + (block_modifier ? " " + block_modifier.trim() : "") + '>' + content + '</td>\n';
};

htmlGen['form'] = function(block){
    var content = htmlGen.statementToCode(block, 'content');
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    return '<form' + (block_modifier ? " " + block_modifier.trim() : "") + '>\n' + content + '</form>\n';
};

htmlGen['input'] = function(block){
    var type = block.getFieldValue('type');
    var value = looseEscape(block.getFieldValue('value'));
    var placeholder = looseEscape(block.getFieldValue('placeholder'));
    var name = looseEscape(block.getFieldValue('name'));

    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    return '<input type="' + type + '" value="' + value + '" placeholder="' + placeholder + '" name="' + name + '"' + (block_modifier ? " " + block_modifier.trim() : "") + '>\n';
};

htmlGen['label'] = function(block){
    var labelFor = block.getFieldValue('for');
    var content = htmlGen.statementToCode(block,'content');

    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    return '<label for="' + looseEscape(labelFor) + '"' + (block_modifier ? " " + block_modifier.trim() : "") + '>' + content + '</label>\n';
};

htmlGen['image'] = function(block){
    var source = block.getFieldValue('source');
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    var code = '<img src="' + (URLInput(source) || 'https://codedragon.org/img/no_image.png') + '"' + (block_modifier ? " " + block_modifier.trim() : "") + '>\n';
    return code;
};

htmlGen['orderedlist'] = function(block){
    var content = htmlGen.statementToCode(block,'content');
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    var code = '<ol' + (block_modifier ? " " + block_modifier.trim() : "") + '>\n' + content + '</ol>\n';
    return code;
};

htmlGen['unorderedlist'] = function(block){
    var content = htmlGen.statementToCode(block,'content');
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    var code = '<ul' + (block_modifier ? " " + block_modifier.trim() : "") + '>\n' + content + '</ul>\n';
    return code;
};

htmlGen['listitem'] = function(block){
    var content = htmlGen.statementToCode(block,'content');
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    var code = '<li' + (block_modifier ? " " + block_modifier.trim() : "") + '>' + content + '</li>\n';
    return code;
};

htmlGen['details'] = function(block){
    var content = htmlGen.statementToCode(block,'content');
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    var code = '<details' + (block_modifier ? " " + block_modifier.trim() : "") + '>\n' + content + '</details>\n';
    return code;
};

htmlGen['summary'] = function(block){
    var content = htmlGen.statementToCode(block,'content');
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);
    var code = '<summary' + (block_modifier ? " " + block_modifier.trim() : "") + '>' + content + '</summary>\n';
    return code;
};

htmlGen['audio'] = function(block){
    var source = block.getFieldValue('source');
    var loop = block.getFieldValue('loop');
    var autoplay = block.getFieldValue('autoplay');
    var controls = block.getFieldValue('controls');
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);

    var code = '<audio' + (block_modifier ? " " + block_modifier.trim() : "");
    if(loop === "TRUE"){
        code += ' loop';
    }
    if(autoplay === "TRUE"){
        code += ' autoplay';
    }
    if(controls === "TRUE"){
        code += ' controls';
    }

    var type;
    switch(source){
        case "8bit.ogg":
            type = "audio/ogg";
            break;
        case "classical.mp3":
            type = "audio/mpeg";
            break;
        case "happy.wav":
            type = "audio/wav";
            break;
    }

    code += '>\n<source src="https://www.codedragon.org/library/media/' + source + '" type="' + type + '">\n</audio>\n';
    return code;
};

htmlGen['video'] = function(block){
    var source = block.getFieldValue('source');
    var loop = block.getFieldValue('loop');
    var autoplay = block.getFieldValue('autoplay');
    var controls = block.getFieldValue('controls');
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC);

    var code = '<video'+(block_modifier ? " " + block_modifier.trim() : "");
    if(loop==="TRUE"){
        code +=' loop';
    }
    if(autoplay==="TRUE"){
        code +=' autoplay';
    }
    if(controls==="TRUE"){
        code +=' controls';
    }

    var type = "video/mp4";
    switch(source){
        case "bbb":
            source = "https://www.codedragon.org/library/media/bigbuckbunny_trail_720p.mp4";
            break;
        case "ld":
            source = "https://www.codedragon.org/library/media/llamadrama_720p.mp4";
            break;
    }
    code += '>\n<source src="' + source + '" type="' + type + '">\n</video>\n';
    return code;
};

htmlGen['script'] = function(block){
    var content = Blockly.JavaScript.statementToCode(block, 'content');
    var code = "<script>\n"+content+"\n</script>\n";
    return code;
};

htmlGen['chart'] = function(block) {
    var block_modifier = htmlGen.statementToCode(block, 'modifier', htmlGen.ORDER_ATOMIC).trim();
    var attributes = (block_modifier ? " " + block_modifier.trim() : "")
    var data = htmlGen.statementToCode(block, 'data', htmlGen.ORDER_ATOMIC);
    var title = looseEscape(block.getFieldValue('title'));
    var subtitle = looseEscape(block.getFieldValue('subtitle'));
    var chartType = block.getFieldValue('type');
    var chartOrientation = '';
    var chartLibrary;
    var chartOptions = 'options';

    if(chartType === 'Column') {
        chartType = 'Bar';
        chartOrientation = 'vertical';
        chartLibrary = 'charts';
    } else if(chartType === 'Bar') {
        chartOrientation = 'horizontal';
        chartLibrary = 'charts';
    } else {
        chartLibrary = 'visualization';
    }

    if(chartType !== 'PieChart') {
        chartOptions = `google.charts.${chartType}.convertOptions(options)`;
    }

    var divId = makeid(6);

    return `
<div id="${divId}" ${attributes}></div>
<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
<script type="text/javascript">
  google.charts.load('current', {'packages':['bar', 'corechart']});
  google.charts.setOnLoadCallback(function() {
    var data = google.visualization.arrayToDataTable([${data}
    ]);
      
    var options = {
      chart: {
        title: '${title}',
        subtitle: '${subtitle}'
      },
      orientation: '${chartOrientation}'
    }
      
    var chart = new google.${chartLibrary}.${chartType}(document.getElementById('${divId}'));
    chart.draw(data, ${chartOptions});
  });
</script>\n`;
};

htmlGen['chart_row'] = function(block) {
    var columns = htmlGen.statementToCode(block, 'columns', htmlGen.ORDER_ATOMIC).trim();
    return `
    [${columns}],`
};

htmlGen['chart_column'] = function(block) {
    var value = looseEscape(block.getFieldValue('value'));

    if(isNaN(value)) {
        value = `'${value}'`;
    }

    return `${value},`;
};

htmlGen['scrollspy'] = function(block) {
    var elementId = looseEscape(block.getFieldValue('element'));
    return `
<script src="https://cdn.jsdelivr.net/gh/cferdinandi/gumshoe@5.1/dist/gumshoe.polyfills.min.js"></script>
<script>
  new Gumshoe('#${elementId} a');
</script>\n`;
};

window.htmlGen = htmlGen;
