$(document).ready(function() {
    $("table[id^='dTbl']").DataTable({
        // dom: 'lfrtipB',
        // dom: 'lftBip',
        "lengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]],
        "buttons": ['csv','excel','print']
    });
});

$(document).ready(function() {
    $("table[id^='tblFill']").DataTable({
    // $('#tblFillListYr').DataTable({
        "lengthMenu": [[15, 30, 50, -1], [15, 30, 50, "All"]],
        "order" : [[6, "desc"]]
    });
});

$(document).ready(function() {
    // $("table[id^='dTblFill']").DataTable({
    $('#dTblRepairListYr').DataTable({
        "lengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]],
        "order" : [[1, "desc"]]
    });
});

$(document).ready(function() {
    // $("table[id^='dTblFill']").DataTable({
    $('#tblParts').DataTable({
        // dom: 'lftBip',
        // dom: '<"top"i>rt<"bottom"flp><"clear">',
        "lengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]],
        "buttons": ['csv','excel','print']
        // "order" : [[1, "desc"]]
    });
});
