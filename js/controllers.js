'use strict';

/* Controllers */

var controlscope = null;

angular.module('raw.controllers', [])

  .controller('RawCtrl', function ($scope, $compile, dataService, sharedProperties) {
    controlscope = $scope;

    $scope.samples = [
      { title : 'Cars (multivariate)', url : 'data/multivariate.csv' },
      { title : 'Movies (dispersions)', url : 'data/dispersions.csv' },
      { title : 'Music (flows)', url : 'data/flows.csv' },
      { title : 'Cocktails (correlations)', url : 'data/correlations.csv' }
    ]

    $scope.dataviewurl = "http://localhost:5000/api/slicer/cube/geometry/cubes_aggregate?cubes=sci_articles&drilldown=geometry__country_level0@dos_level1|sci_articles__time&format=csv";

    $scope.addDataView = function(){
      $scope.sample = {title:"MyDataViz", url:$scope.dataviewurl};
    };

    $scope.$watch('sample', function (sample){
      if (!sample) return;
      dataService.loadSample(sample.url).then(
        function(data){
          $scope.text = data;
        }, 
        function(error){
          $scope.error = error;
        }
      );
    });

    // init
    $scope.raw = raw;
    $scope.data = [];
    $scope.metadata = [];
    $scope.error = false;
    $scope.loading = true;

    $scope.categories = ['Correlations', 'Distributions', 'Time Series', 'Hierarchies', 'Others'];

    $scope.parse = function(text){

      $scope.data = [];
      $scope.metadata = [];
      $scope.error = false;
      $scope.$apply();

      try {
        var parser = raw.parser();
        $scope.data = parser(text);
        $scope.metadata = parser.metadata(text);
        $scope.error = false;
      } catch(e){
        $scope.data = [];
        $scope.metadata = [];
        $scope.error = e.name == "ParseError" ? +e.message : false;
      }
      sharedProperties.initialData($scope.data, $scope.metadata);


      $scope.loading = false;
    }

    $scope.delayParse = dataService.debounce($scope.parse, 500, false);

    $scope.$watch("text", function (text){
      $scope.loading = true;
      $scope.delayParse(text);
    });

    //$scope.charts = raw.charts.values().sort(function (a,b){ return a.title() < b.title() ? -1 : a.title() > b.title() ? 1 : 0; })
    sharedProperties.initialCharts(raw.charts);
    
    $scope.charts = raw.charts.values();


    $scope.$watch('error', function (error){
      if (!$('.CodeMirror')[0]) return;
      var cm = $('.CodeMirror')[0].CodeMirror;
      if (!error) {
        cm.removeLineClass($scope.lastError,'wrap','line-error');
        return;
      }
      cm.addLineClass(error, 'wrap', 'line-error');
      cm.scrollIntoView(error);
      $scope.lastError = error;

    })

    $('body').mousedown(function (e,ui){
      if ($(e.target).hasClass("dimension-info-toggle")) return;
      $('.dimensions-wrapper').each(function (e){
        angular.element(this).scope().open = false;
        angular.element(this).scope().$apply();
      })
    })

    $scope.codeMirrorOptions = {
      lineNumbers : true,
      lineWrapping : true,
      placeholder : 'Paste your text or drop a file here. No data on hand? Try one of our sample datasets!'
    }

    //TO DO do specific chart scope here
    $scope.selectChart = function(chart){
      // if (chart == $scope.chartset[0]) return;
      // $scope.chartset[0].modelstore.clear();
      // $scope.chartset[0] = chart;
      // $scope.chartset[0].modelstore = $scope.chartset[0].model();
    }

    function refreshScroll(){
      $('[data-spy="scroll"]').each(function () {
        $(this).scrollspy('refresh');
      });
    }

    $(window).scroll(function(){

      // check for mobile
      if ($(window).width() < 760 || $('#mapping').height() < 300) return;

      var scrollTop = $(window).scrollTop() + 0,
          mappingTop = $('#mapping').offset().top + 10,
          mappingHeight = $('#mapping').height(),
          isBetween = scrollTop > mappingTop + 50 && scrollTop <= mappingTop + mappingHeight - $(".sticky").height() - 20,
          isOver = scrollTop > mappingTop + mappingHeight - $(".sticky").height() - 20,
          mappingWidth = mappingWidth ? mappingWidth : $('.col-lg-9').width();
     
      if (mappingHeight-$('.dimensions-list').height() > 90) return;
      //console.log(mappingHeight-$('.dimensions-list').height())
      if (isBetween) {
        $(".sticky")
          .css("position","fixed")
          .css("width", mappingWidth+"px")
          .css("top","20px")
      } 

     if(isOver) {
        $(".sticky")
          .css("position","fixed")
          .css("width", mappingWidth+"px")
          .css("top", (mappingHeight - $(".sticky").height() + 0 - scrollTop+mappingTop) + "px");
          return;
      }

      if (isBetween) return;

      $(".sticky")
        .css("position","relative")
        .css("top","")
        .css("width", "");

    })


    //let's register our options here


    $scope.chartoptions = '{"dataSource":"http://localhost:5000/api/slicer/cube/geometry/cubes_aggregate?cubes=sci_articles&drilldown=geometry__country_level0@dos_level1|sci_articles__time&format=csv", "charts": {"chart1": {"chartType":"Small Multiples (Area)","dimensions":[{"key":"0","value":[{"key":"Department of State","type":"String"}]},{"key":"1","value":[{"key":"Year","type":"Number"}]},{"key":"2","value":[{"key":"Amount","type":"Number"}]}],"chartOptions":{"Width":{"type":"number","value":847},"Height":{"type":"number","value":500},"Padding":{"type":"number","value":10},"Use same scale":{"type":"checkbox","value":false},"Color scale":{"type":"color","values":{"AF":"#bf6969","EAP":"#bfbf69","EUR":"#69bf69","NEA":"#69bfbf","SCA":"#6969bf","WHA":"#bf69bf"}}}},"chart2": {"chartType":"Small Multiples (Area)","dimensions":[{"key":"0","value":[{"key":"Department of State","type":"String"}]},{"key":"1","value":[{"key":"Year","type":"Number"}]},{"key":"2","value":[{"key":"Amount","type":"Number"}]}],"chartOptions":{"Width":{"type":"number","value":847},"Height":{"type":"number","value":500},"Padding":{"type":"number","value":10},"Use same scale":{"type":"checkbox","value":true},"Color scale":{"type":"color","values":{"AF":"#bf6969","EAP":"#bfbf69","EUR":"#69bf69","NEA":"#69bfbf","SCA":"#6969bf","WHA":"#bf69bf"}}}}}}';

    $scope.tempstopwatch = false;

    var buildFromOpts = function(){
        var optSet = JSON.parse($scope.chartoptions);
        sharedProperties.initialOptions(optSet);
        //do this in sharedPropreties and cache for later
        //this is where the directive should be loaded
        $scope.chartset = d3.map(optSet['charts']).keys();
        jQuery.each($scope.chartset, function(i,v){
          $(".chartsection").append('<div class="container" data-title="' + v + '" id="' + v + '" chart="chart"><div>');
        });

        /* Get angular to process this block */
        var fnLink = $compile($(".chartsection"));     // returns a Link function used to bind template to the scope
        fnLink($scope);  
    }


    if ($scope.dataviewurl && $scope.chartoptions){
      dataService.loadSample($scope.dataviewurl).then(
        function(data){
          $scope.text = data;
          var temploadwatch = $scope.$watch('loading', function (loading){
            if (loading == false){
                               // Bind Scope to the template
              buildFromOpts();
                      
              //only run once
              temploadwatch();
            }
          });
        }, 
        function(error){
          //replace this with a common error service
          $scope.error = error;
        }
      );
    }


    //TO DO need to fix this not showing
    $scope.enterTempDesc = function(temptitle, tempdescription){
      $scope.temptitle = temptitle;
      $scope.tempdescription = tempdescription;
    }

    $scope.exitTempDesc = function(){
      $scope.temptitle = null;
      $scope.tempdescription = null;
    }

    $scope.dimensionschart = null;

    $scope.selectChart = function(selectedchart){
      //create a chart with all of the default options
      $scope.dimensionschart = selectedchart.chartfunc();
      $scope.dimensionsmodel = $scope.dimensionschart.model();

      //show dimensions
    };

    $scope.createNewChart = function(){
      //make sure that dimensionschartname is set first
      sharedProperties.appendChart($scope.dimensionschartname, $scope.dimensionschart, $scope.dimensionsmodel);


      $(".chartsection").append('<div class="container" data-title="' + $scope.dimensionschartname + '" id="' + $scope.dimensionschartname + '" chart="chart"><div>');


        /* Get angular to process this block */
        var fnLink = $compile($("#" + $scope.dimensionschartname));     // returns a Link function used to bind template to the scope
        fnLink($scope);
        $scope.dimensionschartname = null;
        $scope.dimensionsmodel = null;
        $scope.dimensionschart = null;
    };




    $scope.fetchOptions = function(){
      //need JSON fallback
      var outputobj = {"charts":sharedProperties.getOptionsObj(), "dataSource":$scope.dataviewurl};

      $scope.chartoptions = JSON.stringify(outputobj);
      return;
    };

    $scope.runOptions = function(){
      //memory leak here need to destory other stuff maybe? ~500k
      sharedProperties.destroyAllCharts();
      buildFromOpts();
    };

    
    $(document).ready(refreshScroll);



  })