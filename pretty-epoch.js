const highlight_popup_html = `
<div id="pe2-popup">
  <div id="pe2-popup-content">
    <h3 class="h3-no-padding-top">UTC Time</h3>
    <p id="pretty-epoch-UTC"></p>
    <h3 class="border-bottom">Local Time</h3>
    <p id="pretty-epoch-local-time"></p>
    <h3 class="border-bottom">Difference to now</h3>
    <p id="pretty-epoch-difference"></p>
    <br>
  </div>
</div>
`

var last_highlighted_timestamp = 0.0
var lastSelectedDate = null

$(document).ready(function () {
    $('body').append(highlight_popup_html);

    $('#pe2-popup').click(function (event) {
        event.stopPropagation();
    });

    $(document).dblclick(function (event) {
        processSelectedText(event);
    });

    $(document).bind('mouseup', function (event) {
        processSelectedText(event);
    });

    $(document).click(function (event) {
        if (last_highlighted_timestamp != event.timeStamp) {
            hidePopup();
        }
    });
});

const utc_date_formatter = new Intl.DateTimeFormat(
                                    'en-GB',
                                    {
                                        dateStyle: 'medium',
                                        timeStyle: 'long',
                                        timeZone: 'UTC',
                                    }
                                );

const local_date_formatter = new Intl.DateTimeFormat(
                                    'en-GB',
                                    {
                                        dateStyle: 'medium',
                                        timeStyle: 'long',
                                        timeZone: 'Europe/London',
                                    }
                                );

function showPopup(e, utcDateStr, localFormatDateStr, timeDifference) {
    $('#pe2-popup').css('top', e.pageY + 20 + "px");
    $('#pe2-popup').css('left', e.pageX - 105 + "px");
    $('#pretty-epoch-UTC').html(utcDateStr);
    $('#pretty-epoch-local-time').html(localFormatDateStr);
    $('#pretty-epoch-difference').html(timeDifference);
    $('#pe2-popup').css('visibility', 'visible');
}

function hidePopup() {
    $('#pe2-popup').css('visibility', 'hidden');
}

function processSelectedText(e) {
    let text = getSelectedText();
    if ($.isNumeric(text) && [10, 13].includes(text.length)) {
        if (text.length == 13) {  // Handle millisecond timestamps
            text = text / 1000;
        }
        var date = timestampToDate(text);

        showPopup(e, getUTCString(date), getLocalTimeString(date), compareDateWithCurrentTime(date));
        lastSelectedDate = date
        last_highlighted_timestamp = e.timeStamp
    }
}

function getSelectedText() {
    var text = "";

    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type !== 'Control') {
        text = document.selection.createRange().text;
    }

    return text;
}

function timestampToDate(ts) {
    ts = ts.length === 13 ? parseInt(ts) : ts * 1000;
    return new Date(ts);
}

function getUTCString(date) {
    return utc_date_formatter.format(date);
}

function getLocalTimeString(date) {
    return local_date_formatter.format(date)
}

function compareDateWithCurrentTime(date) {
    // Calculate the difference in milliseconds between the provided datetime and the current datetime
    const differenceMs = new Date() - date;

    // Convert milliseconds to seconds
    const differenceSeconds = Math.floor(differenceMs / 1000);

    // Convert seconds to minutes
    const differenceMinutes = Math.floor((differenceMs / 1000) / 60);

    // Convert minutes to hours
    const differenceHours = Math.floor(differenceMinutes / 60);

    // Convert hours to days
    const differenceDays = Math.floor(differenceHours / 24);

    // Define human-readable strings for different time intervals
    const timeIntervals = [
        { value: differenceDays, unit: "day" },
        { value: differenceHours, unit: "hour" },
        { value: differenceMinutes, unit: "minute" },
        { value: differenceSeconds, unit: "second" }
    ];

    // Find the appropriate time interval to display
    const timePassed = timeIntervals.find(interval => interval.value > 0);

    // Construct the human-readable string
    if (timePassed) {
        const plural = timePassed.value !== 1 ? "s" : ""; // Add plural "s" if necessary
        return `${timePassed.value} ${timePassed.unit}${plural} ago`;
    } else {
        return "Just now";
    }
}

// Not used at the moment
function manipulateTimestamp() {
    // Get the selected option from the dropdown
    var manipulationOption = $('#pretty-epoch-time-manipulation-dropdown').val();

    manipulatedDate = lastSelectedDate

    // Get the values from the input boxes
    var hours = parseInt($('#pretty-epoch-hours-input').val()) || 0;
    var minutes = parseInt($('#pretty-epoch-minutes-input').val()) || 0;
    var seconds = parseInt($('#pretty-epoch-seconds-input').val()) || 0;

    // Manipulate the date based on the selected option
    if (manipulationOption === "add") {
        // Add time
        manipulatedDate.setHours(manipulatedDate.getHours() + hours);
        manipulatedDate.setMinutes(manipulatedDate.getMinutes() + minutes);
        manipulatedDate.setSeconds(manipulatedDate.getSeconds() + seconds);
    } else if (manipulationOption === "remove") {
        // Remove time
        manipulatedDate.setHours(manipulatedDate.getHours() - hours);
        manipulatedDate.setMinutes(manipulatedDate.getMinutes() - minutes);
        manipulatedDate.setSeconds(manipulatedDate.getSeconds() - seconds);
    }

    var resultText = getUTCString(manipulatedDate) + '\n' + compareDateWithCurrentTime(manipulatedDate)

    // Update the manipulated timestamp result
    $('#pretty-epoch-manipulated-timestamp-result').html(resultText); // Update with the manipulated timestamp
}