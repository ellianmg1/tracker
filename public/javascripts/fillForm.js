$(document).ready( () => {
    $( () => {
        // Show Total Cost as Total Gallons and Price/Gal are entered
        $('#total_gal').keyup( () => {
            var totGal = $('#total_gal').val();
            var priceGal = $('#price_per_gal').val();
            var totalCost = totGal * priceGal;
            $('#total_cost').prop('value',totalCost.toFixed(2));
        })
        // Show Calc MPG as Miles and Total Gallons are entered
        $('#miles').keyup( () => {
            var totGal = $('#total_gal').val();
            var miles = $('#miles').val();
            if (totGal > 0){
                var calcMPG = (miles / totGal).toFixed(2);
                $('#calc_mpg').prop('value',calcMPG);
            }
        })
    })
})