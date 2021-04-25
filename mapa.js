d3.json(
  "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/spain/spain-province-with-canary-islands.json"
).then(function(us) {
  rest2(us);
});
function rest2(us) {
  d3.json(
    "https://raw.githubusercontent.com/JorgeVicenteGabriel/visualizacionMSI/master/dataSet10N.json"
  ).then(function(data) {
    console.log("Error");
    console.log(data);
    rest(data, us);
  });
}

function rest(data, us) {
  //variables a declarar
  var width = 960;
  var height = 400;
  var margin = { top: 50, right: 50, bottom: 50, left: 100 };

  var container = d3
    .select("#histograma")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
  var chart = container
    .append("g")
    .attr("id", "chart")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  var tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip-donut")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .text("I'm a circle!");

  var partidoDomain = [1, 2, 3, 4, 5, 6, 7];

  function parseLabel(partido) {
    if (partido["nombre"] == "PSOE") {
      return 2;
    }
    if (partido["nombre"] == "PP") {
      return 1;
    }
    if (partido["nombre"] == "VOX") {
      return 3;
    }
    if (partido["nombre"] == "PSC-PSOE") {
      return 2;
    }
    if (partido["nombre"] == "NA+") {
      return 6;
    }
    if (partido["nombre"] == "ERC-SOBIRANISTES") {
      return 5;
    }
    if (partido["nombre"] == "PSdeG-PSOE") {
      return 2;
    }
    if (partido["nombre"] == "PNV") {
      return 4;
    }
    if (partido["nombre"] == "¡TERUEL EXISTE!") {
      return 7;
    }
    return partido;
  }

  var color = d3
    .scaleOrdinal()
    .range([
      "#33b5e5",
      "#ff4444",
      "#00C851",
      "#21610B",
      "#ffbb33",
      "#FF8000",
      "#07190B"
    ])
    .domain(partidoDomain);

  //definicion de los mapas
  var masVotado = new Map(
    data.datos.map(d => [
      d.escrutinio_sitio.HASC_2,
      parseLabel(d.escrutinio_sitio.resultados.partido[0])
    ])
  );
  function parseLabelpartido(partido) {
    return partido["nombre"] + " " + partido["votos_porciento"] + "%";
  }
  var partidoGanado = new Map(
    data.datos.map(d => [
      d.escrutinio_sitio.HASC_2,
      parseLabelpartido(d.escrutinio_sitio.resultados.partido[0])
    ])
  );
  function parseLabelOnlyCite(partido) {
    return partido["nombre_sitio"];
  }
  var ciudad = new Map(
    data.datos.map(d => [
      d.escrutinio_sitio.HASC_2,
      parseLabelOnlyCite(d.escrutinio_sitio)
    ])
  );
  var mapaGrande = new Map(
    data.datos.map(d => [d.escrutinio_sitio.HASC_2, d.escrutinio_sitio])
  );

  //definicion de la leyenda
  var colorScale = d3
    .scaleOrdinal()
    .domain([
      "PP",
      "PSOE",
      "VOX",
      "PNV",
      "ERC-SOBIRANISTES",
      "NA+",
      "¡TERUEL EXISTE!"
    ])
    .range([
      "#33b5e5",
      "#ff4444",
      "#00C851",
      "#21610B",
      "#ffbb33",
      "#FF8000",
      "#07190B"
    ]);

  var legend_auto = d3
    .legendColor()
    .shapeWidth(30)
    .cells(10)
    .scale(colorScale);

  container
    .append("g")
    .attr("class", "legend_auto")
    .attr("transform", `translate(${width - 150}, ${height - 150})`)
    .style("font-size", "12px")
    .call(legend_auto);

  //definicion del mapa
  var projection = d3
    .geoMercator()
    .center([-3, 33])
    .scale(1200)
    .rotate([0, 0]);

  var path = d3.geoPath().projection(projection);

  chart
    .selectAll("path")
    .data(topojson.feature(us, us.objects.ESP_adm2).features)
    .enter()
    .append("path")
    .attr("fill", d => {
      return color(masVotado.get(d.properties.HASC_2));
    })
    .attr("d", path)
    .on("mouseover", function(d) {
      d3.select(this)
        .transition()
        .duration("50")
        .attr("opacity", ".85");
      tooltip
        .transition()
        .duration("50")
        .style("opacity", 0.9);
      createTooltip(
        ciudad.get(d.properties.HASC_2),
        mapaGrande.get(d.properties.HASC_2)
      );
      return tooltip
        .style("visibility", "visible")
        .html(
          partidoGanado.get(d.properties.HASC_2) +
            "</br>" +
            ciudad.get(d.properties.HASC_2)
        );
    })
    .on("mousemove", function() {
      return tooltip
        .style("top", d3.event.pageY - 10 + "px")
        .style("left", d3.event.pageX + 10 + "px");
    })
    .on("mouseout", function(d, i) {
      d3.select(this)
        .transition()
        .duration("50")
        .attr("opacity", "1");
      tooltip
        .transition()
        .duration("50")
        .style("opacity", 0);
      return tooltip.style("visibility", "hidden");
    });

  function numbotos(votos, divi) {
    const total =
      parseInt(votos.contabilizados.cantidad) +
      parseInt(votos.abstenciones.cantidad) +
      parseInt(votos.nulos.cantidad) +
      parseInt(votos.blancos.cantidad);
    const resul = total / divi;
    console.log("Votos:" + total);
    console.log("divide por:" + divi);
    console.log(parseInt(resul));
    return parseInt(resul);
  }

  function createTooltip(partido, propiedades) {
    //Procesado del titulo
    var div = document.getElementById("provincia");
    while (div.hasChildNodes()) {
      div.removeChild(div.firstChild);
    }
    var tittle = document.createElement("h3");
    var text = document.createTextNode(partido);
    tittle.appendChild(text);
    div.appendChild(tittle);

    //procesado de la tabla
    var Tbl = document.getElementById("table");
    var tblBody = document.getElementById("tboody");

    while (tblBody.hasChildNodes()) {
      tblBody.removeChild(tblBody.firstChild);
    }
    const rela = numbotos(propiedades.votos, propiedades.num_a_elegir);
    var hilera = document.createElement("tr");
    var celda0 = document.createElement("th");
    celda0.className = "thancho";
    var textoCelda0 = document.createTextNode("Nº Votantes");
    var celda1 = document.createElement("td");
    var textoCelda1 = document.createTextNode(
      propiedades.votos.contabilizados.cantidad
    );
    celda0.appendChild(textoCelda0);
    celda1.appendChild(textoCelda1);
    hilera.appendChild(celda0);
    hilera.appendChild(celda1);
    tblBody.appendChild(hilera);

    var hilera = document.createElement("tr");
    var celda0 = document.createElement("th");
    celda0.className = "thancho";
    var textoCelda0 = document.createTextNode("Nº Escaños");
    var celda1 = document.createElement("td");
    var textoCelda1 = document.createTextNode(propiedades.num_a_elegir);
    celda0.appendChild(textoCelda0);
    celda1.appendChild(textoCelda1);
    hilera.appendChild(celda0);
    hilera.appendChild(celda1);
    tblBody.appendChild(hilera);

    var hilera = document.createElement("tr");
    var celda0 = document.createElement("th");
    celda0.className = "thancho";
    var textoCelda0 = document.createTextNode("Nº Personas por Escaño");
    var celda1 = document.createElement("td");
    var textoCelda1 = document.createTextNode(rela);
    celda0.appendChild(textoCelda0);
    celda1.appendChild(textoCelda1);
    hilera.appendChild(celda0);
    hilera.appendChild(celda1);
    tblBody.appendChild(hilera);

    var hilera = document.createElement("tr");
    var celda0 = document.createElement("th");
    celda0.className = "thancho";
    var textoCelda0 = document.createTextNode("Persona/Escaño");
    var celda1 = document.createElement("td");
    var truncar = (1 / rela).toPrecision(2);
    console.log(truncar);
    var textoCelda1 = document.createTextNode((1 / rela).toExponential(2));
    celda0.appendChild(textoCelda0);
    celda1.appendChild(textoCelda1);
    hilera.appendChild(celda0);
    hilera.appendChild(celda1);
    tblBody.appendChild(hilera);

    var separa = document.createElement("br");
    tblBody.appendChild(separa);

    var hilera = document.createElement("tr");
    var celda0 = document.createElement("th");
    var textoCelda0 = document.createTextNode("Partido");
    var celda1 = document.createElement("th");
    var textoCelda1 = document.createTextNode("Escaños");
    var celda2 = document.createElement("th");
    var textoCelda2 = document.createTextNode("Porcentaje");
    var celda3 = document.createElement("th");
    var textoCelda3 = document.createTextNode("Votos");
    celda0.appendChild(textoCelda0);
    celda1.appendChild(textoCelda1);
    celda2.appendChild(textoCelda2);
    celda3.appendChild(textoCelda3);
    hilera.appendChild(celda0);
    hilera.appendChild(celda1);
    hilera.appendChild(celda2);
    hilera.appendChild(celda3);
    tblBody.appendChild(hilera);
    const partidos = propiedades.resultados.partido;
    let i = 0;

    var partidosFiltro = [];
    for (i = 0; i < partidos.length; i++) {
      if (parseInt(partidos[i].electos) > 0) {
        partidosFiltro.push(partidos[i]);

        const nombre = partidos[i].nombre;
        const numEscano = partidos[i].electos;
        const cuantos = partidos[i].votos_porciento;
        const numVotos = partidos[i].votos_numero;

        var hilera = document.createElement("tr");
        var celda0 = document.createElement("td");
        var textoCelda0 = document.createTextNode(nombre);
        celda0.appendChild(textoCelda0);
        hilera.appendChild(celda0);

        var celda1 = document.createElement("td");
        var textoCelda1 = document.createTextNode(numEscano);
        celda1.appendChild(textoCelda1);
        hilera.appendChild(celda1);

        var celda2 = document.createElement("td");
        var textoCelda2 = document.createTextNode(cuantos + "%");
        celda2.appendChild(textoCelda2);
        hilera.appendChild(celda2);

        var celda3 = document.createElement("td");
        var textoCelda3 = document.createTextNode(numVotos);
        celda3.appendChild(textoCelda3);
        hilera.appendChild(celda3);
        tblBody.appendChild(hilera);
      }
    }
    Tbl.appendChild(tblBody);

    //creacion del pie

    // var figura2 = d3plus.viz()
    //     .container("#sector")
    //     .data(partidos)
    //     .type("pie")
    //     .id("nombre")
    //     .size("votos_porciento")
    //     .format("es_ES")
    //     .time("votos_porciento")
    //     .draw()

    // var figura = new d3plus.Pie()
    // .config({
    //     data: partidos,
    //     groupBy: "nombre",
    //     value: function(d) {
    //       return d["votos_porciento"];
    //     }
    //   })
    //   .render();
    var div = document.getElementById("sector");
    while (div.hasChildNodes()) {
      div.removeChild(div.firstChild);
    }

    console.log(partidosFiltro);

    var width = 900;
    height = 900;
    margin = 40;

    var radius = Math.min(width - 400, height - 400) / 2 - margin;

    var svg = d3
      .select("#sector")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // var data = [];
    // var labels = [];
    // for (var j = 0;j < partidos.length; j++){
    //     if (parseInt(partidos[j].electos) > 0)
    //   {
    //       data.push(partidos[j].votos_porciento)
    //       labels.push(partidos[j].nombre)
    //   }
    // }
    // console.log(data)
    //var data = {a: 9, b: 20, c:30, d:8, e:12}
    // var data = partidos.electos

    var color = d3
      .scaleOrdinal()
      .domain([
        "PP",
        "PSOE",
        "VOX",
        "PNV",
        "ERC-SOBIRANISTES",
        "NA+",
        "¡TERUEL EXISTE!",
        "PSdeG-PSOE",
        "PODEMOS-EU",
        "BNG",
        "PODEMOS-EUIB",
        "PODEMOS-EUPV",
        "PODEMOS-IU",
        "MÁS PAÍS-EQUO",
        "JxCAT-JUNTS",
        "PSC-PSOE",
        "ECP-GUANYEM EL CANVI",
        "EH Bildu",
        "PSE-EE",
        "PODEMOS-IU LV CA",
        "Cs",
        "NC-CCa-PNC",
        "CUP-PR",
        "PODEMOS-IX",
        "PRC"
      ])
      .range([
        "#33b5e5",
        "#ff4444",
        "#00C851",
        "#21610B",
        "#ffbb33",
        "#FF8000",
        "#334B52",
        "#ff4444",
        "#572364",
        "#4682b4",
        "#572364",
        "#572364",
        "#572364",
        "#74EED6",
        "#F8FDFF",
        "#ff4444",
        "#F13E9D",
        "#3EF151",
        "#ff4444",
        "#572364",
        "#F78134",
        "#EEE974",
        "#EEE974",
        "#572364",
        "#B8EE74"
      ]);

    // var pie = d3.pie().value(function(d) {return d.value;})
    var pie = d3.pie().value(function(d) {
      return d.votos_porciento;
    });

    // var data_ready = pie(d3.entries(data))
    // // //var data_ready = partidos

    var arcGenerator = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius);

    svg
      .selectAll("mySlices")
      .data(pie(partidosFiltro))
      .enter()
      .append("path")
      .attr("d", arcGenerator)
      .attr("fill", function(d) {
        return color(partidosFiltro[d.index].nombre);
      })
      .attr("stroke", "black")
      .style("stroke-width", "2px");

    svg
      .selectAll("mySlices")
      .data(pie(partidosFiltro))
      .enter()
      .append("text")
      .text(function(d) {
        return (
          partidosFiltro[d.index].nombre +
          "\n" +
          partidosFiltro[d.index].votos_porciento +
          "%"
        );
      })
      .attr("transform", function(d) {
        return "translate(" + arcGenerator.centroid(d) + ")";
      })
      .style("text-anchor", "middle")
      .style("font-size", 17);

    var labelHeight = 18;
    const legend = svg
      .selectAll(".legend")
      .attr("transform", `translate(${width - 150}, ${height - 150})`);

    legend
      .data(pie(partidosFiltro))
      .enter()
      .append("rect")
      .attr("x", 200)
      .attr("y", d => labelHeight * d.index * 1.8 + 140)
      .attr("width", labelHeight)
      .attr("height", labelHeight)
      .attr("fill", function(d, i) {
        console.log(d);
        console.log(i);
        return color(partidosFiltro[d.index].nombre);
      })
      .attr("stroke", "grey")
      .style("stroke-width", "1px");

    legend
      .data(pie(partidosFiltro))
      .enter()
      .append("text")
      .text(function(d) {
        return partidosFiltro[d.index].nombre;
      })
      .attr("x", labelHeight * 1.2 + 200)
      .attr("y", d => labelHeight * d.index * 1.8 + labelHeight + 140)
      .style("font-family", "sans-serif")
      .style("font-size", `${labelHeight}px`);
  }
}
