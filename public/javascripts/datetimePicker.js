$(function() {
    $("input[type=date]").datepicker({
        singleDatePicker: true,
        showdropdowns: true,
        format: 'L'
    }).val();
});