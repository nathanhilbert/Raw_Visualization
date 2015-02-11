'use strict';

/* Controllers */

angular.module('raw.controllers', [])

  .controller('RawCtrl', function ($scope, dataService) {

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

      if ($scope.model) $scope.model.clear();

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
      if (!$scope.data.length && $scope.model) $scope.model.clear();
      $scope.loading = false;
    }

    $scope.parseOptions = function(jsontext){

    };

    $scope.delayParse = dataService.debounce($scope.parse, 500, false);

    $scope.$watch("text", function (text){
      $scope.loading = true;
      $scope.delayParse(text);
    });

    $scope.charts = raw.charts.values().sort(function (a,b){ return a.title() < b.title() ? -1 : a.title() > b.title() ? 1 : 0; });
    $scope.chart = $scope.charts[0];
    $scope.model = $scope.chart ? $scope.chart.model() : null;

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

    $scope.selectChart = function(chart){
      if (chart == $scope.chart) return;
      $scope.model.clear();
      $scope.chart = chart;
      $scope.model = $scope.chart.model();
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


    $scope.chartoptions = '{"chartType":"Small Multiples (Area)","dimensions":[{"key":"0","value":[{"key":"Department of State","type":"String"}]},{"key":"1","value":[{"key":"Year","type":"Number"}]},{"key":"2","value":[{"key":"Amount","type":"Number"}]}],"chartOptions":{"Width":{"type":"number","value":847},"Height":{"type":"number","value":500},"Padding":{"type":"number","value":10},"Use same scale":{"type":"checkbox","value":true},"Color scale":{"type":"color","values":{"AF":"#bf6969","EAP":"#bfbf69","EUR":"#69bf69","NEA":"#69bfbf","SCA":"#6969bf","WHA":"#bf69bf"}}},"dataSource":"http://localhost:5000/api/slicer/cube/geometry/cubes_aggregate?cubes=sci_articles&drilldown=geometry__country_level0@dos_level1|sci_articles__time&format=csv"}';

    $scope.fetchOptions = function(){
      //need JSON fallback
      $scope.chartoptions =  JSON.stringify({
        "chartType": $scope.chart.title(),
        "dimensions": $scope.model.getOptions(),
        "chartOptions": $scope.chart.getOptions(),
        "dataSource" : $scope.dataviewurl
      });
      return;
    };

    $scope.tempstopwatch = false;

    $scope.runOptions = function(){
      //should disable all user options when this is set to true
      var optSet = JSON.parse($scope.chartoptions);
      $scope.model.clear();
      //find the chart name
      $scope.tempstopwatch = true;
      $.each($scope.charts, function(i,v){
        if (v.title() == optSet['chartType']){
          $scope.chart = v;
          $scope.model = $scope.chart.model();
        }
      });
      $scope.model.setOptions(optSet['dimensions']);
      $scope.$apply();
      $scope.chart.setOptions(optSet['chartOptions'], $scope);
      $scope.tempstopwatch = false;
      $scope.$emit('update');

    };


    $(document).ready(refreshScroll);

    if ($scope.dataviewurl && $scope.chartoptions){
      dataService.loadSample($scope.dataviewurl).then(
        function(data){
          $scope.tempstopwatch = true;
          $scope.text = data;
          var temploadwatch = $scope.$watch('loading', function (loading){
            if (loading == false){
              $scope.runOptions();
              temploadwatch();
            }
          });
        }, 
        function(error){
          $scope.error = error;
        }
      );
    }

  })