
class TaskStatus extends HTMLElement {
    connectedCallback() {
      const status = this.getAttribute('status') || 'pending';
      const label = status === 'completed' ? '✅' : '⏳';
      this.innerHTML = `
        <span class="task-status ${status}">
          ${label}
        </span>
      `;
    }
  }
  
  customElements.define('task-status', TaskStatus);