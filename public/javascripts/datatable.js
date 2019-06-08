$(document).ready(function() {
    $("table[id^='dTbl']").DataTable(
        {"lengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]]
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
        "lengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]],
        // "order" : [[1, "desc"]]
    });
});
