$(".confirm-delete").click(function () {
    var text = $(this).attr("data-id");
    $("#del_id").val(text);
});

$(".copyProfile").click(function () {
    var text = $(this).attr("data-id");
    $("#profile_id").val(text);
});

$(".set_val").click(function () {
    var text = $(this).attr("name");
    if (text == "all") {
        var selected = [];
        $('input[name^="selected_id"]:checked').each(function () {
            selected.push($(this).val());
        });
        $("#del_id").val(selected);
        $("#edit_id").val(selected);
        $("#ref_id").val(selected);
    } else {
        $("#del_id").val(text);
    }
});

$(".checkbox_checkout").click(function () {
    var selected2 = [];
    $('input[name^="selected_id"]:checked').each(function () {
        selected2.push($(this).val());
    });
    if (selected2 == "") {
        $('#dell_all').hide();
    } else {
        $('#dell_all').show();
    }

});

// Listen for click on toggle checkbox
$('.cb-select-all-1').click(function (event) {
    if (this.checked) {
        // Iterate each checkbox
        $(':checkbox').each(function () {
            this.checked = true;
            $('#dell_all').show();
        });
    } else {
        $(':checkbox').each(function () {
            this.checked = false;
            $('#dell_all').hide();
        });
    }
});

$(".slugbtn").click(function () {
    $("#slug").prop('readonly', false);
});
