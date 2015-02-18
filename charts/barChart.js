var globalselection = null;
var globaldata = null;
var globalbyYears = null;
var globaldim = null;

raw.charts.set('Bar Chart', {
    title: "Bar Chart",
    thumbnail: 'imgs/barChart.png',
    description: "A bar chart",
    category: "Distributions",
    chartfunc: function(){

    	var barsmodel = function(){

		    var bars = raw.model();

		    var x = bars.dimension('x')
		      .title("X Axis")
		      .types(Number, Date)
		      .accessor(function (d){ return this.type() == "Date" ? new Date(d) : +d; })
		      .required(1)

		    var size = bars.dimension('size')
		      .title("Size")
		      .multiple(true)
		      .types(Number)
		      .required(1)

		    // var color = points.dimension('color')
		    //   .title("Color")

		    var label = bars.dimension('label')
		      .title("Label")
		      .multiple(true)

		    bars.map(function (data){
		      return data.map(function (d){
		        return {
		          x : x(d),
		          size : size() ? +size(d) : 1,
		          label : label(d)
		        }
		      })
		    })

		    return bars;

		  };



		var bars = barsmodel();

		var chart = raw.chart()
			.title('Bar Chart')
			.description(
	            "A bar chart")
			.thumbnail("imgs/barChart.png")
		    .category('Distributions')
			.model(bars)

		var width = chart.number()
			.title("Width")
			.defaultValue(1000)
			//.fitToWidth(true)

		var height = chart.number()
			.title("Height")
			.defaultValue(500)

		var widthColumn = chart.number()
			.title("Width Column")
			.defaultValue(20)

		var verticalDisplay = chart.checkbox()
			.title("Vertical Display")
			.defaultValue(true)

		var colors = chart.color()
			 .title("Color scale")


		chart.draw(function (selection, data){

			// Retrieving dimensions from model
			var x = bars.dimensions().get('x');

			globalselection = selection;
			globaldata = data;

			  // Create the crossfilter for the relevant dimensions and groups.
			  var mydata = crossfilter(data),
			      all = mydata.groupAll(),
			      byYear = mydata.dimension(function(d) { return d.x}),
			      byYears = byYear.group().reduceSum(function(d) { return d.size; });

			 globaldim = byYear;
			 globalbyYears = byYears;
				
			var g = selection
				.attr("width", +width() )
				.attr("height", +height() )
				.append("g")

			var maxRadius = function(){
				return 0;
			}

			var marginLeft = 20,
				marginBottom = 20,
				w = width() - marginLeft,
				h = height() - marginBottom;

			var barWidth = Math.floor(w / 19) - 1;

			var xExtent = d3.extent(byYears.all(), function (d){ return d.key; }),
				yExtent = d3.extent(byYears.all(), function (d){ return d.value; });

			var xScale = x.type() == "Date"
					? d3.time.scale().range([marginLeft,width()-maxRadius()]).domain(xExtent)
					: d3.scale.linear().range([marginLeft,width()-maxRadius()]).domain(xExtent);
			
			var yScale = d3.scale.linear().range([h,0]).domain(yExtent);

			var sizeScale = d3.scale.linear().range([0,h]).domain(yExtent);

				//sizeScale = d3.scale.linear().range([1, Math.pow(+maxRadius(),2)*Math.PI]).domain([0, d3.max(data, function (d){ return d.size; })]),
			var xAxis = d3.svg.axis().scale(xScale).tickSize(-h+maxRadius()*2).orient("bottom");//.tickSubdivide(true),
    		var yAxis = d3.svg.axis().scale(yScale).ticks(10).tickSize(-w+maxRadius()).orient("left");


	        g.append("g")
	            .attr("class", "x axis")
	            .style("stroke-width", "1px")
	        	.style("font-size","10px")
	        	.style("font-family","Arial, Helvetica")
	            .attr("transform", "translate(" + 0 + "," + (h-maxRadius()) + ")")
	            .call(xAxis);

	      	g.append("g")
	            .attr("class", "y axis")
	            .style("stroke-width", "1px")
	            .style("font-size","10px")
				.style("font-family","Arial, Helvetica")
	            .attr("transform", "translate(" + marginLeft + "," + 0 + ")")
	            .call(yAxis);

	        d3.selectAll(".y.axis line, .x.axis line, .y.axis path, .x.axis path")
	         	.style("shape-rendering","crispEdges")
	         	.style("fill","none")
	         	.style("stroke","#ccc")

          // g.selectAll("g.bar")
          //     .data(["background", "foreground"])
          //   .enter().append("path")
          //     .attr("class", function(d) { return d + " bar"; })
          //     .datum(byYears.all());

	        // g.selectAll("g.bar")
         //      .append("path")
         //      .attr("class", function(d) { return d + " bar"; })
         //      .datum(byYears.all());


			var bar = g.selectAll("g.bar")
				.data(byYears.all())
				.enter().append("g")
					.attr("class","bar")
					.style("fill", function(d) { return colors() ? colors()(d.color) : "#eeeeee"; })
	            	.style("fill-opacity", .9)
	    	    	.attr("transform", function(d, i) { return "translate(" + xScale(d.key) + "," + yScale(d.value) + ")"; })
				.append("rect")
	              .attr("width", 20)
	              .attr("height", function(d){ return sizeScale(d.value);});

			colors.domain(data, function(d){ return d.color; });

	    	// bar.append("bar")
	     //        .style("fill", function(d) { return colors() ? colors()(d.color) : "#eeeeee"; })
	     //        .style("fill-opacity", .9)
	    	//     .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.size) + ")"; })
	    	// .append("rect")
      //         .attr("width", 20)
      //         .attr("height", 100);



	    	    //.attr("r", function (d){ return Math.sqrt(sizeScale(d.size)/Math.PI); });

	    	// circle.append("text")
	    	//     .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; })
	    	// 	.attr("text-anchor", "middle")
	    	// 	.style("font-size","10px")
	    	// 	.attr("dy", 15)
	    	// 	.style("font-family","Arial, Helvetica")
	    	//   	.text(function (d){ return d.label? d.label.join(", ") : ""; });

		});
		return chart;
	}

});