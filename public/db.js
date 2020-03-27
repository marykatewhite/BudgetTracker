export function checkForIndexedDb() {
  if (!window.indexedDB) {
    console.log("Nope!");
    return false;
  }
  return true;
}

const request = window.indexedDB.open("budget", 1);
let db;

request.onupgradeneeded = function(e) {
  let db = request.result;
  db.createObjectStore("transaction", { autoIncrement: true });
};

request.onerror = function(e) {
  console.log("There was an error");
};

function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => {        
        return response.json();
      })
      .then(() => {
        const transaction = db.transaction(["pending"], "readwrite");
        const store = transaction.objectStore("pending");
        store.clear();
      });
    }
  };
}

window.addEventListener("online", checkDatabase);
