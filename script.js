(function () {
  var storageKey = "retirementBlessingsForChiefsV1";
  var messagesGrid = document.getElementById("messagesGrid");
  var messageForm = document.getElementById("messageForm");
  var nameInput = document.getElementById("nameInput");
  var messageInput = document.getElementById("messageInput");
  var copyLinkButton = document.getElementById("copyLinkButton");
  var exportButton = document.getElementById("exportButton");
  var importInput = document.getElementById("importInput");
  var shareOutput = document.getElementById("shareOutput");
  var submitButton = messageForm.querySelector(".primary-button");
  var editIndex = -1;
  var cancelEditButton = document.createElement("button");

  cancelEditButton.className = "ghost-button";
  cancelEditButton.hidden = true;
  cancelEditButton.textContent = "取消編輯";
  cancelEditButton.type = "button";
  submitButton.insertAdjacentElement("afterend", cancelEditButton);

  var seedMessages = [
    {
      name: "總務科同仁",
      text: "謝謝官長、主任多年來的照顧與帶領，祝福退休生活平安順心、自在愉快。"
    },
    {
      name: "法院同仁",
      text: "感謝一路上的提醒與支持，願往後每一天都有好心情，也有更多屬於自己的時間。"
    }
  ];

  function encodeMessages(messages) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(messages))));
  }

  function decodeMessages(value) {
    try {
      var json = decodeURIComponent(escape(atob(value)));
      var parsed = JSON.parse(json);
      return Array.isArray(parsed) ? sanitizeMessages(parsed) : null;
    } catch (error) {
      return null;
    }
  }

  function sanitizeMessages(items) {
    return items
      .filter(function (item) {
        return item && typeof item.text === "string" && item.text.trim();
      })
      .slice(0, 100)
      .map(function (item) {
        return {
          name: String(item.name || "匿名祝福").trim().slice(0, 16),
          text: String(item.text).trim().slice(0, 110)
        };
      });
  }

  function readHashMessages() {
    var match = window.location.hash.match(/messages=([^&]+)/);
    return match ? decodeMessages(match[1]) : null;
  }

  function loadMessages() {
    var hashMessages = readHashMessages();
    if (hashMessages && hashMessages.length) {
      localStorage.setItem(storageKey, JSON.stringify(hashMessages));
      return hashMessages;
    }

    try {
      var saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      return Array.isArray(saved) ? sanitizeMessages(saved) : seedMessages;
    } catch (error) {
      return seedMessages;
    }
  }

  function saveMessages(messages) {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }

  function renderMessages(messages) {
    messagesGrid.innerHTML = "";

    if (!messages.length) {
      var empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "目前還沒有祝福，先寫下第一句話。";
      messagesGrid.appendChild(empty);
      return;
    }

    messages.forEach(function (message, index) {
      var card = document.createElement("article");
      card.className = "message-card";

      var text = document.createElement("p");
      text.textContent = message.text;

      var name = document.createElement("strong");
      name.textContent = "— " + (message.name || "匿名祝福");

      var actions = document.createElement("div");
      actions.className = "message-actions";

      var editButton = document.createElement("button");
      editButton.className = "edit-message-button";
      editButton.dataset.index = String(index);
      editButton.textContent = "編輯";
      editButton.type = "button";

      actions.appendChild(editButton);
      card.appendChild(text);
      card.appendChild(name);
      card.appendChild(actions);
      messagesGrid.appendChild(card);
    });
  }

  function resetEditMode() {
    editIndex = -1;
    submitButton.textContent = "送出祝福";
    cancelEditButton.hidden = true;
  }

  function clearForm() {
    nameInput.value = "";
    messageInput.value = "";
    resetEditMode();
  }

  function startEdit(index) {
    var message = messages[index];
    if (!message) return;

    editIndex = index;
    nameInput.value = message.name || "";
    messageInput.value = message.text || "";
    submitButton.textContent = "儲存編輯";
    cancelEditButton.hidden = false;
    shareOutput.textContent = "正在編輯一則祝福。";
    messageInput.focus();
  }

  function makeShareUrl(messages) {
    var url = window.location.href.split("#")[0];
    return url + "#messages=" + encodeMessages(messages);
  }

  function showManualCopy(url) {
    shareOutput.innerHTML = "";
    var note = document.createElement("div");
    note.textContent = "如果瀏覽器無法自動複製，請手動複製以下連結：";
    var textarea = document.createElement("textarea");
    textarea.value = url;
    textarea.rows = 3;
    shareOutput.appendChild(note);
    shareOutput.appendChild(textarea);
    textarea.select();
  }

  var messages = loadMessages();
  renderMessages(messages);

  messageForm.addEventListener("submit", function (event) {
    event.preventDefault();

    var text = messageInput.value.trim();
    if (!text) return;

    var nextMessage = {
      name: nameInput.value.trim() || "匿名祝福",
      text: text
    };

    if (editIndex >= 0 && messages[editIndex]) {
      messages[editIndex] = nextMessage;
      shareOutput.textContent = "祝福已更新。";
    } else {
      messages.unshift(nextMessage);
      shareOutput.textContent = "祝福已送出。";
    }

    messages = sanitizeMessages(messages);
    saveMessages(messages);
    renderMessages(messages);
    clearForm();
  });

  messagesGrid.addEventListener("click", function (event) {
    var button = event.target.closest(".edit-message-button");
    if (!button) return;

    startEdit(Number(button.dataset.index));
  });

  cancelEditButton.addEventListener("click", function () {
    clearForm();
    shareOutput.textContent = "已取消編輯。";
  });

  copyLinkButton.addEventListener("click", function () {
    var url = makeShareUrl(messages);

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(function () {
        shareOutput.textContent = "分享連結已複製。";
      }).catch(function () {
        showManualCopy(url);
      });
      return;
    }

    showManualCopy(url);
  });

  exportButton.addEventListener("click", function () {
    var blob = new Blob([JSON.stringify(messages, null, 2)], {
      type: "application/json"
    });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "retirement-blessings.json";
    link.click();
    URL.revokeObjectURL(link.href);
  });

  importInput.addEventListener("change", function () {
    var file = importInput.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function () {
      try {
        var imported = sanitizeMessages(JSON.parse(reader.result));
        messages = sanitizeMessages(imported.concat(messages));
        saveMessages(messages);
        renderMessages(messages);
        shareOutput.textContent = "祝福已匯入。";
      } catch (error) {
        shareOutput.textContent = "匯入檔案格式不正確，請選擇 JSON 檔。";
      }
      importInput.value = "";
    };
    reader.readAsText(file);
  });
})();
