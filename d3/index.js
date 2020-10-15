let svg = null;

let worldmeta = null; //地图
let data = null; //数据
let myscale=[-1000,0,5,10,50,100,300,1000];
let color = ["#E9AF1F","#E8921B","#E4751B","#E25819","#DE3A17","#DC1C17","#DA0116","#000"];
let compute = d3.scaleOrdinal()
    		.domain(myscale)
    		.range(color);

let linear = function(d){
    for(let i=0;i<myscale.length-1;i++){


        if(Number(d)<myscale[i+1]) {
            return myscale[i];
        }
        
    } 
   
 }




window.addEventListener("resize", () => {
    showdata();
});

window.addEventListener("load", async function () { //同步
    await getdata();
    showdata();
});

async function getdata() {
    let map = await d3.json("./d3/countries-50m.json");
    data = await d3.csv("./d3/all_month.csv");
    worldmeta = topojson.feature(map, map.objects.countries);
    console.log(worldmeta.features);
    console.log(data);
    data.forEach(element => {
        element["longitude"] = Number(element["longitude"]);
        element["latitude"] = Number(element["latitude"]);
        element["mag"] = Number(element["mag"]);
        element["depth"] = Number(element["depth"]);

    });

    console.log(data);
}

function showdata() {
    d3.select("#mapdata").select("svg").remove();
    let height = document.getElementById("mapdata").offsetHeight;
    let width = document.getElementById("mapdata").offsetWidth;

    let zoom = d3.zoom()
        .scaleExtent([.7, 100])
        .on("zoom", function () {
            g.attr("transform", d3.event.transform);
        });
    svg = d3.select("#mapdata").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);
    let tip = d3.tip().attr('class', 'd3-tip').html(function (d) {
        return `
        <table class="table" style="background-color: rgba(200, 200, 200, 0.37);">
	<thead>
		<tr>
			<th>place</th>
			<th>${d["place"]}</th>

		</tr>
	</thead>
	<tbody>
	
		<tr  class="danger">
			<td>depth</td>
			<td>${d["depth"]}</td>
        </tr>
        <tr  class="danger">
			<td>time</td>
			<td>${d["time"]}</td>
		</tr>
	</tbody>
</table>
            `
    });

    let g = svg.append("g");
    g.call(tip);

    let projection = d3.geoEquirectangular();

    let pathGenerator = d3.geoPath().projection(projection);
    // this code is really important if you want to fit your geoPaths (map) in your SVG element; 
    projection.fitSize([width*1.5, height*1.5], worldmeta);
    // perform data-join; 
    let paths = g.selectAll('path')
        .data(worldmeta.features, d => d.properties.name)
        .enter().append('path')
        .attr('d', pathGenerator)
        .attr('stroke', 'black')
        .attr("fill", "#B0B6C2")
        .attr('stroke-width', 0.5)
        .attr("opacity", .6)
        .on('mouseover', function (d) {
            d3.select(this)
                .attr("opacity", .3)
                .attr("stroke", "red")
                .attr("stroke-width", 0.8);

        })
        .on('mouseout', function (d) {
            d3.select(this)
                .attr("opacity", .6)
                .attr("stroke", "black")
                .attr("stroke-width", 0.5);

        })





    // g.selectAll(".rect")
    //     .data(data)
    //     .enter()
    //     .append("circle")
    //     .attr("fill", "#008")
    //     .attr('stroke', 'black')
    //     .attr("stroke-width", .1)
    //     .attr("opacity", .6)
    //     .attr("cx", function (d, i) {
    //         return projection([d["longitude"], d["latitude"]])[0]
    //         // return projection([0,0])[0]
    //     })
    //     .attr("cy", (d) => {
    //         return projection([d["longitude"], d["latitude"]])[1]
    //         // return projection([0,0])[1]
    //     })
    //     .attr("r", d => d["depth"]/30)
    //     .attr("transform", "translate(" + (-width * .06) + "," + 0 + ") ")
    //     .on('mouseover', function (d) {
    //         d3.select(this)
    //             .attr("opacity", .9)
    //             .attr("stroke-width", .5);
    //         tip.show(d);
    //     })
    //     .on('mouseout', function (d) {
    //         d3.select(this)
    //             .attr("opacity", .6)
    //             .attr("stroke-width", .1);
    //         tip.hide();
    //     });

    g.selectAll(".rect")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "rect");





    g.selectAll(".rect")
        .data(data)
        .append("circle")
        .attr("fill", d=>compute(linear(d["depth"])))
        .attr('stroke', 'black')
        .attr("stroke-width", .1)
        .attr("opacity", .7)
        .attr("cx", function (d, i) {
            return projection([d["longitude"], d["latitude"]])[0]
            // return projection([0,0])[0]
        })
        .attr("cy", (d) => {
            return projection([d["longitude"], d["latitude"]])[1]
            // return projection([0,0])[1]
        })
        .attr("r", 5)
        .on('mouseover', function (d) {
            d3.select(this)
                .attr("stroke-width", .6);
            tip.show(d);
        })
        .on('mouseout', function (d) {
            d3.select(this)
                .attr("stroke-width", .1);
            tip.hide();
        });






    g.selectAll(".rect")
        .data(data)
        .append('line')
        .attr("stroke-width", 3)
        .attr("stroke", d=>compute(linear(d["depth"])))
        .attr("stroke-dasharray", "1.7,0.7")
        .attr('x1', d => projection([d["longitude"], d["latitude"]])[0]+1)
        .attr('y1', d => projection([d["longitude"], d["latitude"]])[1]-1)
        .attr('x2', d => projection([d["longitude"], d["latitude"]])[0] + d["depth"] / 3)
        .attr('y2', d => projection([d["longitude"], d["latitude"]])[1] - d["depth"] / 3)



        svg.selectAll('.le').data(d3.range(myscale.length-1)).enter()
        .append('rect')
        .attr('x', (d) => width - 80)
        .attr('y', (d) => d * 40 + 40)
        .attr('width', 60)
        .attr('height', 20)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr('fill', (d, i) => compute(myscale[i]))
        .on('mouseover', function (d) {
            d3.select(this)
                .attr("opacity", .9)
                .attr("stroke", "red")
                .attr("stroke-width", 1);
        })
        .on('mouseout', function (d) {
            d3.select(this)
                .attr("opacity", 1)
                .attr("stroke", "black")
                .attr("stroke-width", 1);
        });


        svg.selectAll('.letext').data(d3.range(myscale.length-1)).enter()
        .append('text')
        .text(d => {
            if (d == 0) {
                return `<0`
            }
            
            if (d == myscale.length-2) {
                return `>${myscale[d]}`
            }

            return `${myscale[d]}-${myscale[d+1]}`
        })
        .attr('x', (d) => width - 80)
        .attr('y', (d) => d * 40 + 75)
        .attr('fill', "black");

        svg.append('text')
        .text("Earthquakes in the past 30 days")
        .attr('x', width - 250)
        .attr('y', 20)
        .attr('fill', "black");




}






