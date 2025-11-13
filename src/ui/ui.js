/**
 * @fileoverview UI Manager - handles menus, buttons, modals
 * @module ui/ui
 */

/**
 * UIManager class - manages all user interface elements
 * @class UIManager
 */
export class UIManager {
  constructor() {
    this.root = document.getElementById('ui-root')
    console.log('[UI] Initialized')
  }

  /**
   * Show main menu
   */
  showMainMenu() {
    console.log('[UI] Showing main menu')
    // TODO: Implement in Epic 4.1+
  }

  /**
   * Show level complete modal
   * @param {number} levelNumber - Completed level number
   */
  showVictoryModal(levelNumber) {
    console.log('[UI] Showing victory modal')
    // TODO: Implement in Epic 4.7+
  }

  /**
   * Update game HUD (top bar, stats)
   * @param {Object} gameState - Current game state
   */
  updateHUD(gameState) {
    console.log('[UI] Updating HUD')
    // TODO: Implement in Epic 4.4+
  }
}
