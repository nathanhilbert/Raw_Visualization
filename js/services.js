'use strict';


/* Services */

angular.module('raw.services', [])

	.factory('dataService', function ($http, $q, $timeout) {
		  
		  return {
		    
		    loadSample : function(sample){
		      var deferred = $q.defer();
		      $http.get(sample)
			      .then(function(response){
			          deferred.resolve(response.data);
			      },
			      function(){
			          deferred.reject("An error occured while getting sample (" + sample.title + ")");
			      });
		      
		      return deferred.promise;
		    },

		    debounce : function (func, wait, immediate) {
			    var timeout;
			    var deferred = $q.defer();
			    return function() {
			      var context = this, args = arguments;
			      var later = function() {
			        timeout = null;
			        if(!immediate) {
			          deferred.resolve(func.apply(context, args));
			          deferred = $q.defer();
			        }
			      };
			      var callNow = immediate && !timeout;
			      if ( timeout ) {
			        $timeout.cancel(timeout);
			      }
			      timeout = $timeout(later, wait);
			      if (callNow) {
			        deferred.resolve(func.apply(context,args));
			        deferred = $q.defer();
			      }
			      return deferred.promise;
			    };
			  }
	  	}
	})
	.factory('sharedProperties', function () {

		var optSet = null;
		var defaultCharts = null;
		var data = null;
		var metadata = null;
		var charts = {};
		var models = {}

		return {
			initialCharts: function(rawCharts){
				defaultCharts = rawCharts.values().sort(function (a,b){ return a.title() < b.title() ? -1 : a.title() > b.title() ? 1 : 0; })
			},
			initialOptions: function(optSetArg){
				optSet = optSetArg;
			},
			initialData: function(dataArg, metadataArg){
				data = dataArg;
				metadata = metadataArg;
			},
			getDefaultChart: function(chartname){
				var tempreturn;
		        raw.charts.forEach(function(i,v){
		          if (i == optSet['charts'][chartname]['chartType']){
		          	tempreturn = v.chartfunc();
		          	return false;
		          }
		        });
		        return tempreturn;
			},
			getOptions: function(chartname){
				//check that this exists
				return optSet['charts'][chartname];
			},
			getData: function(){
				return data;
			},
			appendChart: function(chartname, chartobj, modelobj){
				charts[chartname] = chartobj;
				models[chartname] = modelobj
			},
			chartExists: function(chartname){
				return charts.hasOwnProperty(chartname);
			},
			getChart: function(chartname){
				return charts[chartname];
			},
			getModel: function(chartname){
				return models[chartname];
			},
			getOptionsObj: function(){
				var tempoutput = {};
				jQuery.each(charts, function(i,v){
			        tempoutput[i] = {
			          "chartType": charts[i].title(),
			          "dimensions": models[i].getOptions(),
			          "chartOptions": charts[i].getOptions()
			        };
			    });
			    return tempoutput;
		    },
		    runOptionsObj: function(){

		    },
		    destroyAllCharts: function(){
		    	var tempchartskey = d3.map(charts).keys();
		    	jQuery.each(tempchartskey, function(index,chartname){
			    	$("#" + chartname).remove();
			    	delete charts[chartname];
			    	delete models[chartname];
		    	});
		    }
			
		};
    });
