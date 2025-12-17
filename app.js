class RPNCalculator {
    constructor() {
        this.stack = new Array(100).fill(0);
        this.stackPointer = 0;
        this.inputBuffer = '';
        this.isEnteringNumber = false;
        this.lastOperation = null;

        this.initializeElements();
        this.attachEventListeners();
        this.updateDisplay();
        this.registerServiceWorker();
    }

    initializeElements() {
        this.inputDisplay = document.getElementById('input-display');
        this.stackCountEl = document.getElementById('stack-count');
        this.stackDisplays = [
            document.querySelector('#stack-0 .stack-value'),
            document.querySelector('#stack-1 .stack-value'),
            document.querySelector('#stack-2 .stack-value'),
            document.querySelector('#stack-3 .stack-value'),
            document.querySelector('#stack-4 .stack-value')
        ];
    }

    attachEventListeners() {
        document.querySelectorAll('.btn-number').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const number = e.target.dataset.number;
                const action = e.target.dataset.action;

                if (action === 'decimal') {
                    this.handleDecimal();
                } else {
                    this.handleNumber(number);
                }
            });
        });

        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleOperator(action);
            });
        });

        document.querySelectorAll('.btn-function').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleFunction(action);
            });
        });

        document.querySelector('.btn-enter').addEventListener('click', () => {
            this.handleEnter();
        });

        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    handleNumber(num) {
        if (!this.isEnteringNumber) {
            this.inputBuffer = num;
            this.isEnteringNumber = true;
        } else {
            this.inputBuffer += num;
        }
        this.updateInputDisplay();
    }

    handleDecimal() {
        if (!this.isEnteringNumber) {
            this.inputBuffer = '0.';
            this.isEnteringNumber = true;
        } else if (!this.inputBuffer.includes('.')) {
            this.inputBuffer += '.';
        }
        this.updateInputDisplay();
    }

    handleEnter() {
        if (this.isEnteringNumber) {
            const value = parseFloat(this.inputBuffer);
            this.push(value);
            this.inputBuffer = '';
            this.isEnteringNumber = false;
        } else {
            this.push(this.stack[this.stackPointer]);
        }
        this.updateDisplay();
    }

    handleOperator(operation) {
        if (this.isEnteringNumber) {
            this.handleEnter();
        }

        if (this.stackPointer < 1) {
            this.showError();
            return;
        }

        const b = this.pop();
        const a = this.pop();
        let result;

        switch (operation) {
            case 'add':
                result = a + b;
                break;
            case 'subtract':
                result = a - b;
                break;
            case 'multiply':
                result = a * b;
                break;
            case 'divide':
                if (b === 0) {
                    this.push(a);
                    this.push(b);
                    this.showError('División por cero');
                    return;
                }
                result = a / b;
                break;
        }

        this.push(result);
        this.lastOperation = operation;
        this.updateDisplay();
    }

    handleFunction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'drop':
                this.drop();
                break;
            case 'swap':
                this.swap();
                break;
            case 'negate':
                this.negate();
                break;
        }
        this.updateDisplay();
    }

    push(value) {
        if (this.stackPointer >= 100) {
            this.showError('Pila llena');
            return;
        }
        this.stack[this.stackPointer] = value;
        this.stackPointer++;
    }

    pop() {
        if (this.stackPointer <= 0) {
            return 0;
        }
        this.stackPointer--;
        return this.stack[this.stackPointer];
    }

    clear() {
        if (this.isEnteringNumber) {
            this.inputBuffer = '';
            this.isEnteringNumber = false;
        } else {
            this.stack.fill(0);
            this.stackPointer = 0;
        }
    }

    drop() {
        if (this.stackPointer > 0) {
            this.pop();
        }
    }

    swap() {
        if (this.stackPointer >= 2) {
            const temp = this.stack[this.stackPointer - 1];
            this.stack[this.stackPointer - 1] = this.stack[this.stackPointer - 2];
            this.stack[this.stackPointer - 2] = temp;
        }
    }

    negate() {
        if (this.isEnteringNumber) {
            if (this.inputBuffer.startsWith('-')) {
                this.inputBuffer = this.inputBuffer.substring(1);
            } else {
                this.inputBuffer = '-' + this.inputBuffer;
            }
            this.updateInputDisplay();
        } else if (this.stackPointer > 0) {
            this.stack[this.stackPointer - 1] *= -1;
            this.updateDisplay();
        }
    }

    updateDisplay() {
        this.updateStackDisplay();
        this.updateInputDisplay();
        this.updateStackCount();
    }

    updateStackDisplay() {
        for (let i = 0; i < 5; i++) {
            const stackIndex = this.stackPointer - 1 - i;
            if (stackIndex >= 0) {
                this.stackDisplays[i].textContent = this.formatNumber(this.stack[stackIndex]);
            } else {
                this.stackDisplays[i].textContent = '0';
            }
        }
    }

    updateInputDisplay() {
        if (this.isEnteringNumber) {
            this.inputDisplay.textContent = this.inputBuffer || '0';
        } else {
            if (this.stackPointer > 0) {
                this.inputDisplay.textContent = this.formatNumber(this.stack[this.stackPointer - 1]);
            } else {
                this.inputDisplay.textContent = '0';
            }
        }
    }

    updateStackCount() {
        this.stackCountEl.textContent = this.stackPointer;
    }

    formatNumber(num) {
        if (num === 0) return '0';
        if (Math.abs(num) < 0.000001 || Math.abs(num) > 999999999) {
            return num.toExponential(6);
        }

        const str = num.toString();
        if (str.length > 12) {
            return parseFloat(num.toPrecision(10)).toString();
        }
        return str;
    }

    showError(message = 'Error') {
        const originalText = this.inputDisplay.textContent;
        this.inputDisplay.textContent = message;
        this.inputDisplay.style.color = '#ff4444';

        setTimeout(() => {
            this.inputDisplay.style.color = '';
            this.updateInputDisplay();
        }, 1000);
    }

    handleKeyboard(e) {
        e.preventDefault();

        if (e.key >= '0' && e.key <= '9') {
            this.handleNumber(e.key);
        } else if (e.key === '.') {
            this.handleDecimal();
        } else if (e.key === 'Enter') {
            this.handleEnter();
        } else if (e.key === '+') {
            this.handleOperator('add');
        } else if (e.key === '-') {
            this.handleOperator('subtract');
        } else if (e.key === '*') {
            this.handleOperator('multiply');
        } else if (e.key === '/') {
            this.handleOperator('divide');
        } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
            this.handleFunction('clear');
        } else if (e.key === 'Backspace') {
            this.handleFunction('drop');
        } else if (e.key === 's' || e.key === 'S') {
            this.handleFunction('swap');
        }

        this.updateDisplay();
    }

    registerServiceWorker() {
        const statusEl = document.getElementById('pwa-status');

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('Service Worker registrado:', registration);
                    if (statusEl) statusEl.textContent = 'PWA lista para instalar';
                })
                .catch(error => {
                    console.error('Error al registrar Service Worker:', error);
                    if (statusEl) statusEl.textContent = 'Error en Service Worker';
                });
        } else {
            console.warn('Service Worker no soportado');
            if (statusEl) statusEl.textContent = 'Service Worker no soportado';
        }

        this.checkPWAStatus();
    }

    checkPWAStatus() {
        console.log('=== Estado PWA ===');
        console.log('Service Worker soportado:', 'serviceWorker' in navigator);
        console.log('HTTPS:', window.location.protocol === 'https:' || window.location.hostname === 'localhost');
        console.log('Manifest vinculado:', document.querySelector('link[rel="manifest"]') !== null);
        console.log('Instalado:', window.matchMedia('(display-mode: standalone)').matches);
    }
}

let calculator;

window.addEventListener('DOMContentLoaded', () => {
    calculator = new RPNCalculator();
});

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt event fired!');
    e.preventDefault();
    deferredPrompt = e;

    const statusEl = document.getElementById('pwa-status');
    if (statusEl) statusEl.textContent = 'Lista para instalar';

    const installPrompt = document.createElement('div');
    installPrompt.className = 'install-prompt';
    installPrompt.textContent = 'Instalar App';
    installPrompt.onclick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response: ${outcome}`);
            deferredPrompt = null;
            installPrompt.remove();
        }
    };

    document.body.appendChild(installPrompt);
    setTimeout(() => installPrompt.classList.add('show'), 1000);
});

window.addEventListener('appinstalled', () => {
    console.log('PWA instalada exitosamente');
    deferredPrompt = null;
});
