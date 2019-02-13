// var dps = [];
// console.log(dps);
window.onload = function () {
    var chart = new CanvasJS.Chart('chartContainer', {
        // title: {
        //     text : 'Progress',
        //     fontWeight: 'lighter',
        //     fontFamily: 'sans-serif',
        //     // horizontalAlign: 'left'
        // },
        animationEnabled: true,
        axisX: {labelAngle: -20, valueFormatString:" "
        },
        axisY: {includeZero: false},
        data: [
        {
            type: 'spline',
            // xValueFormatString:"string",
            dataPoints: dps
            // { x: "06-Apr-18", y: 28.58 },
            // { x: "26-Mar-18", y: 28.12 },
            // { x: "23-Mar-18", y: 29.30 },
            // { x: "20-Mar-18", y: 28.65 },
            // { x: "19-Mar-18", y: 27.67 },                                    
            // { x: 30, y: 15 },
            // { x: 40, y: 20 },
            // { x: 50, y: 22 }
            
        }
        ]
    });
    chart.render();
}
