"use strict";

const addBtns = document.querySelectorAll("button");
const kanbanCols = document.querySelectorAll(".kanban-col");
const reset = document.querySelector("a");

let num = 0;

function createInput(btn) {
  btn.previousElementSibling.insertAdjacentHTML(
    "beforeend",
    `<div class="container">
    <input draggable="true" type="text" class="active-input-${num}" value="Task ${
      num < 10 ? "0" + num : num
    }"/>
    <button class="clear clear-${num}"><i class="fa-trash-can fa-regular"></i></button>
    <button class="edit edit-${num}"><i class="fa-pen-to-square fa-regular"></i></button>      
    </div> `
  );
}

function inputHandler() {
  addBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      num += 1;
      createInput(btn);
      storage();
      dragging();
      dropping();
      const active = document.querySelector(`.active-input-${num}`);
      active.select();
      focusOut(active);
    });
  });
}

function focusOut(active) {
  active.addEventListener("focusout", () => {
    active.readOnly = true;
    storage();
  });
  active.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      active.blur();
      window.getSelection().removeAllRanges();
      active.readOnly = true;
    }
  });
}

function clearAndEditListener() {
  kanbanCols.forEach((kanbanCol) => {
    kanbanCol.addEventListener("click", (e) => {
      const target = e.target;
      let el = target.parentElement.parentElement;
      let clicked = target.className.split(" ")[1];
      if (clicked === "fa-regular") {
        clicked = target.parentElement.className.split(" ")[1];
      } else {
        el = target.parentElement;
      }
      const action = clicked?.split("-")[0];
      if (action === "clear") {
        const ans = confirm(
          `Are You Sure That You want to delete : \t"${el.firstElementChild.value}"`
        );
        if (ans) {
          el.remove();
          storage();
        }
      } else if (action === "edit") {
        el.firstElementChild.readOnly = false;
        el.firstElementChild.select();
        focusOut(el.firstElementChild);
      }
    });
  });
}

// DRAG && DROP
function dragging() {
  const inputContainer = document.querySelectorAll(".container");
  inputContainer.forEach((task) => {
    task.addEventListener("dragstart", () => {
      task.firstElementChild.classList.add("is-dragging");
    });
  });
  inputContainer.forEach((task) => {
    task.addEventListener("dragend", () => {
      task.firstElementChild.classList.remove("is-dragging");
      storage();
    });
  });
}
function dropping() {
  kanbanCols.forEach((dropZone) => {
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      const bottomTask = insertAboveTask(dropZone, e.clientY);
      const draggingTask = document.querySelector(".is-dragging").parentElement;
      if (!bottomTask) {
        dropZone.appendChild(draggingTask);
      } else {
        dropZone.insertBefore(draggingTask, bottomTask);
      }
    });
  });
}
//---------------------------------------------
function insertAboveTask(dropZone, mouseY) {
  const elments = dropZone.querySelectorAll("input:not(.is-dragging)");

  let closesetTask = null;
  let closesetOffset = Number.NEGATIVE_INFINITY;

  elments.forEach((task) => {
    const pTask = task.parentElement;

    const { top } = pTask.getBoundingClientRect();
    const diff = mouseY - top;
    if (diff < 0 && diff > closesetOffset) {
      closesetOffset = diff;
      closesetTask = pTask;
    }
  });
  return closesetTask;
}
//------------------------------------------------------------------------------------------------

// Local Storage
function printStorage() {
  let i = 0;
  let num2 = 0;
  kanbanCols.forEach((kanbanCol) => {
    let vals = window.localStorage.getItem(i);
    vals = vals ? vals.split(",") : [];
    for (let j = 0; j < vals.length; j += 2) {
      num2 = Number(vals[j + 1]);
      kanbanCol.insertAdjacentHTML(
        "beforeend",
        `<div class="container">
        <input draggable="true" type="text" class="active-input-${num2}" readOnly value="${vals[j]}"/>
          <button class="clear clear-${num2}"><i class="fa-trash-can fa-regular"></i></button>
          <button class="edit edit-${num2}"><i class="fa-pen-to-square fa-regular"></i></button>      
          </div> `
      );
    }
    i += 1;
    num = Math.max(num, num2);
  });
}

function storage() {
  let i = 0;
  for (const kanbanCol of kanbanCols) {
    const vals = [];
    for (const task of kanbanCol.children) {
      const targetTask = task.firstElementChild;
      const className = targetTask.className;
      vals.push(targetTask.value, className.split("-")[2]);
    }
    window.localStorage.setItem(i, vals.toString());
    i += 1;
  }
}
///////////////////////////////////////////////////////////////////////////
function resetPage() {
  reset.addEventListener("click", () => {
    const ans = confirm(`Are You Sure That You want to reset the page`);
    if (ans) {
      localStorage.clear();
      location.reload();
    }
  });
}

function init() {
  resetPage();
  printStorage();
  inputHandler();
  clearAndEditListener();
  dragging();
  dropping();
}

init();
