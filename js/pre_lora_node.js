import { app } from "../../scripts/app.js";

app.registerExtension({
	name: "INT8.PreLoraLoader",
	async beforeRegisterNodeDef(nodeType, nodeData, app) {
		if (nodeData.name === "INT8PreLoraLoader") {
			const onNodeCreated = nodeType.prototype.onNodeCreated;
			nodeType.prototype.onNodeCreated = function () {
				const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
				
				this.updateRemoveBtn = () => {
					let maxIndex = 0;
					for (let i = 0; i < this.widgets.length; i++) {
						const w = this.widgets[i];
						if (w && w.name) {
							const match = w.name.match(/lora_name_(\d+)/);
							if (match) {
								maxIndex = Math.max(maxIndex, parseInt(match[1]));
							}
						}
					}
					
					if (maxIndex > 1) {
						if (!this.removeBtn) {
							this.removeBtn = this.addWidget("button", "Remove LoRA", "Remove LoRA", () => {
								let mIdx = 0;
								let maxNameWidget = null;
								let maxStrengthWidget = null;
								for (let i = 0; i < this.widgets.length; i++) {
									const w = this.widgets[i];
									if (w && w.name) {
										const match = w.name.match(/lora_name_(\d+)/);
										if (match) {
											const idx = parseInt(match[1]);
											if (idx > mIdx) {
												mIdx = idx;
												maxNameWidget = w;
											}
										}
										const matchStr = w.name.match(/lora_strength_(\d+)/);
										if (matchStr) {
											const idx = parseInt(matchStr[1]);
											if (idx === mIdx) {
												maxStrengthWidget = w;
											}
										}
									}
								}
								
								if (mIdx > 1) { // Never remove the first lora
									if (maxNameWidget) {
										this.widgets.splice(this.widgets.indexOf(maxNameWidget), 1);
									}
									if (maxStrengthWidget) {
										this.widgets.splice(this.widgets.indexOf(maxStrengthWidget), 1);
									}
									
									this.updateRemoveBtn();
									
									const sz = this.computeSize();
									this.size[0] = Math.max(this.size[0], sz[0]);
									this.size[1] = Math.max(this.size[1], sz[1]);
									this.setDirtyCanvas(true, true);
								}
							});
						} else {
							// Ensure it's at the bottom
							const idx = this.widgets.indexOf(this.removeBtn);
							if (idx !== -1) {
								this.widgets.splice(idx, 1);
								this.widgets.push(this.removeBtn);
							}
						}
					} else {
						if (this.removeBtn) {
							const idx = this.widgets.indexOf(this.removeBtn);
							if (idx !== -1) {
								this.widgets.splice(idx, 1);
							}
							this.removeBtn = null;
						}
					}
				};
				
				const addBtn = this.addWidget("button", "Add LoRA", "Add LoRA", () => {
					let maxIndex = 0;
					for (let i = 0; i < this.widgets.length; i++) {
						const w = this.widgets[i];
						if (w && w.name) {
							const match = w.name.match(/lora_name_(\d+)/);
							if (match) {
								maxIndex = Math.max(maxIndex, parseInt(match[1]));
							}
						}
					}
					
					const nextIndex = maxIndex + 1;
					
					let loraOptions = [];
					for (let i = 0; i < this.widgets.length; i++) {
						if (this.widgets[i] && this.widgets[i].name && this.widgets[i].name.startsWith("lora_name_")) {
							loraOptions = this.widgets[i].options.values;
							break;
						}
					}

					this.addWidget("combo", `lora_name_${nextIndex}`, loraOptions[0] || "None", () => {}, { values: loraOptions });
					this.addWidget("number", `lora_strength_${nextIndex}`, 1.0, () => {}, { min: -10.0, max: 10.0, step: 0.01, precision: 2 });
					
					this.updateRemoveBtn();
					
					const sz = this.computeSize();
					this.size[0] = Math.max(this.size[0], sz[0]);
					this.size[1] = Math.max(this.size[1], sz[1]);
					this.setDirtyCanvas(true, true);
				});
				
				// Move addBtn to top
				this.widgets.splice(this.widgets.indexOf(addBtn), 1);
				this.widgets.unshift(addBtn);

				// Fix the precision of the initial lora_strength_1 to display 2 decimals
				for (let i = 0; i < this.widgets.length; i++) {
					if (this.widgets[i] && this.widgets[i].name === "lora_strength_1") {
						this.widgets[i].options.precision = 2;
					}
				}
				
				// Initially call update RemoveBtn to ensure correct state (should be hidden)
				this.updateRemoveBtn();
				
				return r;
			};
			
			const onConfigure = nodeType.prototype.onConfigure;
			nodeType.prototype.onConfigure = function (info) {
				const r = onConfigure ? onConfigure.apply(this, arguments) : undefined;
				if (this.updateRemoveBtn) {
					this.updateRemoveBtn();
				}
				return r;
			};
		}
	}
});
