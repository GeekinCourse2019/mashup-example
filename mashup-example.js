/*
 * Basic responsive mashup template
 * @owner Enter you name here (xxx)
 */
/*
 *    Fill in host and port for Qlik engine
 */
var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/extensions" ) + 1 );
var config = {
	host: window.location.hostname,
	prefix: prefix,
	port: window.location.port,
	isSecure: window.location.protocol === "https:"
};
require.config( {
	baseUrl: ( config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources"
} );

require( ["js/qlik"], function ( qlik ) {
	qlik.setOnError( function ( error ) {
		$( '#popupText' ).append( error.message + "<br>" );
		$( '#popup' ).fadeIn( 1000 );
	} );
	$( "#closePopup" ).click( function () {
		$( '#popup' ).hide();
	} );

	//callbacks -- inserted here --
	//open apps -- inserted here --
	var app = qlik.openApp('Consumer Sales.qvf', config);

	//get objects -- inserted here --
	// app.getObject('QV03','akDGX');
	// app.getObject('QV02','JcJvj');
	app.getObject('CurrentSelections','CurrentSelections');
	//app.getObject('QV01','Ydsxt');

	var chart1 = app.visualization.get('Ydsxt');
	
	chart1.then(function(vis){
		vis.show("QV01");

		setTimeout(function(){
			$("#page-container").css("opacity", 1);
		}, 300);
		
	});

	window.showChart = function(chart){
		if(chart === 'chart1'){
			app.getObject('QV01','Ydsxt');
		}

		if(chart === 'chart2'){
	app.getObject('QV01','JcJvj');
		}

		if(chart === 'chart3'){
			app.getObject('QV01','akDGX');
		}

		$(".nav-item").removeClass("active");
		$("." + chart).addClass("active");
	};

	//create cubes and lists -- inserted here --

	var field = app.field('Product Sub Group Desc');
	field.getData();
	  
	//bind data
	function fieldListener(){
		field.rows.forEach(function(fieldValue){
			var option = $("<a class='dropdown-item'>"+fieldValue.qText+"</a>");
			option.on("click", function(){
				selectProduct(fieldValue.qText);
			});
			
			$("#product-dropdown").append(option);
		});

		field.OnData.unbind(fieldListener);
	}

	field.OnData.bind(fieldListener);
	
	window.selectProduct = function(param){
		app.field("Product Sub Group Desc").selectValues([param], false, true);

		$("#dropdownMenuButton").text(param);
	};


	

	app.createCube({
		qDimensions : [{
			qDef : {
				qFieldDefs : ["Product Group Desc"]
			}
		},{
			qDef : {
				qFieldDefs : ["Product Sub Group Desc"]
			}
		}],
		qMeasures : [{
			qDef : {
				qDef : "Sum ([Sales Amount])"
			}
		}],
		qInitialDataFetch : [{
			qTop : 0,
			qLeft : 0,
			qHeight : 20,
			qWidth : 3
		}]
	}, function(reply) {
		var data = [];
		reply.qHyperCube.qDataPages[0].qMatrix.forEach(function(qRow){
			var found;
			data.forEach(function(item){
				if(item.name === qRow[0].qText){
					found = item;
				}
			});

			if(found){
				found.children.push({
					name: qRow[1].qText,
					value: qRow[2].qNum
				});
			}else{
				var newProduct = {
					name: qRow[0].qText,
					children: [{
						name: qRow[1].qText,
						value: qRow[2].qNum
					}]
				};

				data.push(newProduct);
			}
		});

		option = {
			title: {
				text: 'Product Sales',
				textStyle: {
					fontSize: 14,
					align: 'center'
				},
				subtextStyle: {
					align: 'center'
				}
			},
			series: {
				type: 'sunburst',
				highlightPolicy: 'ancestor',
				data: data,
				radius: [0, '95%'],
				sort: null,
				levels: [{}, {
					r0: '15%',
					r: '35%',
					itemStyle: {
						borderWidth: 2
					},
					label: {
						rotate: 'tangential'
					}
				}, {
					r0: '35%',
					r: '70%',
					label: {
						align: 'right'
					}
				}]
			}
		};

		var myChart = echarts.init(document.getElementById('hypercube-chart'));
		myChart.setOption(option);
	});
} );
