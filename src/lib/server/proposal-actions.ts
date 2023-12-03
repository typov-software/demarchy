export async function createDraftProposal() {
  /**
   * TODO
   * Create a draft proposal
   * Can be done by any workspace member or higher
   */
}

export async function openProposal() {
  /**
   * TODO
   * Open a draft proposal's access to the workspace members it was submitted to
   * Can be done by any workspace member or higher
   */
}

export async function dropProposal() {
  /**
   * TODO
   * Remove a proposal from being considered by the group
   * Can be done by proposal owner or admins
   */
}

export async function requestClarifyingQuestions() {
  /**
   * TODO
   * Moves a proposal into a phase where clarifying questions are addressed
   */
}

export async function requestConcerns() {
  /**
   * TODO
   * Moves a proposal into a phase where concerns are addressed
   * Adds a temperature poll to gauge proposal interest
   */
}

export async function addTemperatureCheck() {
  /**
   * TODO
   * Adds a temperature poll to a proposal, an amendment, or a concern
   * - Activity on temperature polls may affect consensus conditions
   */
}

export async function addAmendment() {
  /**
   * TODO
   * Adds an amendment to a proposal in the form of a comment or additional document changes
   * Can be done by any workspace member or higher
   */
}

export async function adoptAmendment() {
  /**
   * TODO
   * Adopts the changes or suggestions from an emendment
   * Can be done by proposal owner or admins
   */
}

export async function checkConsensus() {
  /**
   * TODO
   * Moves a proposal into a phase where consensus is evaluated
   * Adds a stand-aside poll to a proposal
   * Adds a block poll to a proposal
   * Adds explicit conditions that defines consensus
   */
}

export async function standAside() {
  /**
   * TODO
   * Adds a record to a proposal that a member does not approve but is not willing to block
   * Adds optional comment to record of stand-aside
   * Can be done by any workspace member or higher
   */
}

export async function blockProposal() {
  /**
   * TODO
   * Adds a block to a proposal
   * Can be done by any workspace member or higher
   */
}

export async function resolveBlock() {
  /**
   * TODO
   * Resolves a block on a proposal
   * Can be down by block owner or admins
   */
}

export async function addComment() {
  /**
   * TODO
   * Adds a comment to a proposal, amendment, block, or comment
   * Can be done by any workspace member or higher
   */
}

export async function addReaction() {
  /**
   * TODO
   * Adds an emotional reaction record to a proposal, amendment, comment, or block
   * - Reactions are reflected in the UI with emojis, counts, and visualizations (horizontal bar)
   * Can be done by any workspace member or higher
   */
}

export async function ghost() {
  /**
   * TODO
   * Adds a "ghost" reaction to a proposal, amendment, comment, or block.
   * - The purpose of a ghost reaction is to actively ignore someone or something
   * - Reflected in the UI with opacity based on percent ghosted
   * - Revealable on hover
   * Can be done by any workspace member or higher
   */
}

export async function requestAdoption() {
  /**
   * TODO
   * Adds an adoption poll to a proposal that has not reached consensus
   * - Adoption threshold determined by workspace settings determined by members
   * Can be done by automation, proposal owner, or admins after consensus fails
   */
}

export async function adoptProposal() {
  /**
   * TODO
   * Merges a proposals changes into the workspace library and activity record
   * Can be done by automation, proposal owner, or admins after consensus conditions reached
   */
}
