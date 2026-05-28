        // 
        //
        // const initialQuestions = {
        //     start: {
        //         text: "Bạn muốn học mảng nào?",
        //         options: [
        //             { label: "Frontend", next: "frontend" },
        //             { label: "Backend", next: "backend" }
        //         ]
        //     },
        //     frontend: {
        //         text: "Bạn muốn học gì trong Frontend?",
        //         options: [
        //             { label: "HTML/CSS", next: "html_css_result" },
        //             { label: "JavaScript", next: "js_result" }
        //         ]
        //     },
        //     backend: {
        //         text: "Bạn muốn học gì trong Backend?",
        //         options: [
        //             { label: "Node.js", next: "node_result" },
        //             { label: "Python", next: "python_result" }
        //         ]
        //     },
        //     html_css_result: { result: "Bạn nên học layout, flexbox, grid, responsive." },
        //     js_result: { result: "Bạn nên học DOM, event, async/await, fetch." },
        //     node_result: { result: "Bạn nên học Node.js, Express, REST API." },
        //     python_result: { result: "Bạn nên học Python, FastAPI, database." }
        // };
        
        const initialQuestions = {};

        class DecisionTreeManager {
            constructor(initialData) {
                this.tree = JSON.parse(JSON.stringify(initialData));
            }

            addOrUpdateNode(nodeId, nodeData) {
                this.tree[nodeId] = nodeData;
            }
            
            deleteNode(nodeId) {
                if (nodeId === 'start') {
                    alert("Cannot delete the 'start' node!");
                    return;
                }
                
                delete this.tree[nodeId];
                
                // Auto-cleanup: remove options that point to the deleted node
                Object.keys(this.tree).forEach((key) => {
                    const node = this.tree[key];
                    if (node.options) {
                        node.options = node.options.filter(opt => opt.next !== nodeId);
                    }
                });
            }

            // Maps relationships between nodes
            getRelationships() {
                const refs = {};
                Object.keys(this.tree).forEach(k => refs[k] = { in: [], out: [] });
                
                Object.entries(this.tree).forEach(([sourceId, node]) => {
                    if (node.options) {
                        node.options.forEach(opt => {
                            if (refs[sourceId]) refs[sourceId].out.push(opt.next);
                            if (refs[opt.next]) refs[opt.next].in.push(sourceId);
                        });
                    }
                });
                return refs;
            }
        }

        const treeManager = new DecisionTreeManager(initialQuestions);

        // USER APP LOGIC 
        const questionBox = document.getElementById("questionBox");
        const backBtn = document.getElementById("backBtn");
        const restartBtn = document.getElementById("restartBtn");

        let currentQuestionId = "start";
        let historyStack = [];

        function renderQuestion() {
            const currentQuestion = treeManager.tree[currentQuestionId];
            questionBox.innerHTML = ""; 

            if (!currentQuestion) {
                questionBox.innerHTML = `<p class="result error-result"><strong>Error:</strong> Node '${currentQuestionId}' not found. The Admin needs to add this node!</p>`;
                return;
            }

            if (currentQuestion.result) {
                questionBox.innerHTML = `<div class="result"> ${currentQuestion.result}</div>`;
                return;
            }

            const title = document.createElement("h2");
            title.className = "question-title";
            title.textContent = currentQuestion.text;
            questionBox.appendChild(title);

            if (!currentQuestion.options || currentQuestion.options.length === 0) {
                 questionBox.innerHTML += `<p style="color:#e74c3c">No options available! This is a dead end.</p>`;
                 return;
            }

            currentQuestion.options.forEach((option) => {
                const button = document.createElement("button");
                button.className = "option-btn";
                button.textContent = `${option.label} →`;

                button.addEventListener("click", () => {
                    historyStack.push(currentQuestionId);
                    currentQuestionId = option.next;
                    renderQuestion();
                });
                questionBox.appendChild(button);
            });
        }

        backBtn.addEventListener("click", () => {
            if (historyStack.length === 0) return;
            currentQuestionId = historyStack.pop();
            renderQuestion();
        });

        restartBtn.addEventListener("click", () => {
            currentQuestionId = "start";
            historyStack = [];
            renderQuestion();
        });


        // 4. ADMIN PANEL LOGIC
        const adminForm = document.getElementById('adminForm');
        const nodeTypeSelect = document.getElementById('nodeType');
        const optionsConfig = document.getElementById('optionsConfig');
        const nodeList = document.getElementById('nodeList');
        const editSelect = document.getElementById('editSelect');
        const nodeIdInput = document.getElementById('nodeId');
        const datalist = document.getElementById('nodeIdsList');

        // Toggle Option inputs based on Node Type
        nodeTypeSelect.addEventListener('change', (e) => {
            optionsConfig.style.display = e.target.value === 'question' ? 'flex' : 'none';
        });

        // Handle Form Submission with Validation
        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const id = document.getElementById('nodeId').value.trim();
            const type = document.getElementById('nodeType').value;
            const text = document.getElementById('nodeText').value.trim();

            if(!id || !text) return;

            let nodeData = {};
            const opt1N = document.getElementById('opt1Next').value.trim();
            const opt2N = document.getElementById('opt2Next').value.trim();

            if (type === 'result') {
                nodeData = { result: text };
            } else {
                nodeData = { text: text, options: [] };
                
                const opt1L = document.getElementById('opt1Label').value.trim();
                if (opt1L && opt1N) nodeData.options.push({ label: opt1L, next: opt1N });

                const opt2L = document.getElementById('opt2Label').value.trim();
                if (opt2L && opt2N) nodeData.options.push({ label: opt2L, next: opt2N });
            }

            // VALIDATION: Check if target nodes exist
            if (type !== 'result') {
                const missingTargets = [];
                if (opt1N && !treeManager.tree[opt1N]) missingTargets.push(opt1N);
                if (opt2N && !treeManager.tree[opt2N]) missingTargets.push(opt2N);
                
                if (missingTargets.length > 0) {
                    const confirmSave = confirm(`Warning: The target node(s) '${missingTargets.join("', '")}' do not exist yet. This will create a broken link until you add them.\n\nSave anyway?`);
                    if (!confirmSave) return; // Stop submission
                }
            }

            // Save via manager
            treeManager.addOrUpdateNode(id, nodeData);
            
            // Reset to "Create mode" automatically after saving
            resetFormToCreateMode();
            refreshAdminList();
            
            // Ép Live Preview nhảy ngay lập tức tới node vừa được tạo/sửa để xem trước
            currentQuestionId = id;
            historyStack.push('start'); // Giả lập lịch sử để nút Back có thể hoạt động
            renderQuestion();
        });

        // Handle dropdown selection to edit
        editSelect.addEventListener('change', (e) => {
            const selectedId = e.target.value;
            if (selectedId) {
                populateFormForEdit(selectedId);
            } else {
                resetFormToCreateMode();
            }
        });

        function resetFormToCreateMode() {
            adminForm.reset();
            editSelect.value = "";
            nodeIdInput.value = 'id' + Date.now(); // Tự động tạo ID bằng Timestamp
            nodeIdInput.readOnly = true; // Khóa input không cho nhập tay
            optionsConfig.style.display = 'flex';
            adminForm.classList.remove('highlight-form');
            document.getElementById('submitBtn').textContent = "Save New Node";
        }

        function populateFormForEdit(id) {
            const node = treeManager.tree[id];
            if (!node) return;

            adminForm.classList.add('highlight-form');
            document.getElementById('submitBtn').textContent = "Update Node";
            
            editSelect.value = id;
            nodeIdInput.value = id;
            nodeIdInput.readOnly = true; // Khóa ID khi edit để tránh tạo link chết

            if (node.result) {
                document.getElementById('nodeType').value = 'result';
                document.getElementById('nodeText').value = node.result;
                optionsConfig.style.display = 'none';
                
                document.getElementById('opt1Label').value = '';
                document.getElementById('opt1Next').value = '';
                document.getElementById('opt2Label').value = '';
                document.getElementById('opt2Next').value = '';
            } else {
                document.getElementById('nodeType').value = 'question';
                document.getElementById('nodeText').value = node.text;
                optionsConfig.style.display = 'flex';
                
                document.getElementById('opt1Label').value = node.options[0] ? node.options[0].label : '';
                document.getElementById('opt1Next').value = node.options[0] ? node.options[0].next : '';
                
                document.getElementById('opt2Label').value = node.options[1] ? node.options[1].label : '';
                document.getElementById('opt2Next').value = node.options[1] ? node.options[1].next : '';
            }
        }

        // Render the list of nodes
        function refreshAdminList() {
            nodeList.innerHTML = '';
            editSelect.innerHTML = '<option value="">➕ Create New Node</option>';
            datalist.innerHTML = '';
            
            const relationships = treeManager.getRelationships();

            Object.entries(treeManager.tree).forEach(([id, data]) => {
                // 1. Add to Dropdown
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = `Edit: ${id}`;
                editSelect.appendChild(opt);

                // 2. Add to Datalist (autocomplete)
                const dlOpt = document.createElement('option');
                dlOpt.value = id;
                datalist.appendChild(dlOpt);

                // 3. Add to UI List
                const li = document.createElement('li');
                li.className = 'node-item';
                
                const typeBadge = data.result ? '<span class="badge result">Result</span>' : '<span class="badge">Question</span>';
                const previewText = data.result ? data.result : data.text;
                
                const rel = relationships[id];
                const incoming = rel && rel.in.length > 0 ? rel.in.join(', ') : 'None';
                const outgoing = rel && rel.out.length > 0 ? rel.out.join(', ') : 'None';

                li.innerHTML = `
                    <div class="node-info">
                        <div class="node-id">${id} ${typeBadge}</div>
                        <div class="node-preview">"${previewText.substring(0, 40)}${previewText.length > 40 ? '...' : ''}"</div>
                        <div class="node-relationships">
                            <strong>Linked from:</strong> ${incoming} <br>
                            <strong>Points to:</strong> ${outgoing}
                        </div>
                    </div>
                    <div class="node-actions">
                        <button class="edit-btn" onclick="handleEditClick('${id}')">Edit</button>
                        <button class="delete-btn" onclick="handleDeleteClick('${id}')">Delete</button>
                    </div>
                `;
                nodeList.appendChild(li);
            });
        }

        window.handleEditClick = function(id) {
            populateFormForEdit(id);
            // Scroll to top to see form
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        window.handleDeleteClick = function(id) {
            if(confirm(`Are you sure you want to delete '${id}'? This will also remove any buttons pointing to it.`)) {
                treeManager.deleteNode(id);
                resetFormToCreateMode();
                refreshAdminList();
                
                // If user is viewing the deleted node, restart them
                if (currentQuestionId === id) {
                    currentQuestionId = 'start';
                    historyStack = [];
                }
                renderQuestion();
            }
        };

        // Initialize Everything
        renderQuestion();
        refreshAdminList();
        resetFormToCreateMode(); // Khởi 