function save_options() {
  var downloadas = document.querySelector('input[name="downloadas"]:checked')
    .id;
  var custom_filename = document.getElementById('custom_filename').value;
  chrome.storage.sync.set(
    {
      opt_dwnld_type: downloadas,
      opt_custom_fname: custom_filename,
    },
    function () {
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function () {
        status.textContent = '';
      }, 1000);
    }
  );
}

function restore_options() {
  chrome.storage.sync.get(function (items) {
    document.getElementById(items.opt_dwnld_type).checked = true;
    document.getElementById('custom_filename').value = items.opt_custom_fname;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
