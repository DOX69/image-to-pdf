---
description: Create a Pull Request with automated CI verification
---

# Create Pull Request Workflow

This workflow automates the process of creating a Pull Request and verifying its integrity through local tests and CI.

````xml
<workflow name="Create Pull Request">
  <overview>
    This workflow automates the PR creation lifecycle, including branch management, local validation (linting/testing), and CI monitoring.
  </overview>

  <steps>
    <step id="1" name="Branch Verification">
      <command>git branch --show-current</command>
      <logic>
        <if condition="branch is NOT 'main' or 'staging'">
          <then>
            <user_prompt message="You are already on side branch &lt;branch-name&gt;. Do you want to proceed with validation and push? [Y/N]" />
            <on_response value="Y">
              <sub_steps>
                <sub_step>Analyze changes to generate a descriptive commit message based on the diff vs current branch.</sub_step>
                <call step="4" reason="Local Validation" />
                <call step="5" reason="Update Project Context (if needed)" />
                <command>git add .</command>
                <command>git commit -m &quot;&lt;descriptive-message&gt;&quot;</command>
                <command>git push</command>
                <task>Verify if PR description is up to date with latest changes via `gh` CLI.</task>
                <monitor_status title="Monitor Side Branch PR Status">
                  <command>gh pr list --head &lt;branch-name&gt;</command>
                  <if condition="PR exists">
                    <then><goto step="10" /></then>
                    <else>Ask user: Create draft PR or end workflow?</else>
                  </if>
                </monitor_status>
              </sub_steps>
              <terminate status="success" />
            </on_response>
            <if_response value="N">
              <terminate status="aborted" reason="Incorrect branch context." />
            </if_response>
          </then>
        </if>
        <else>
          <continue />
        </else>
      </logic>
    </step>
    
    <step id="2" name="Verify GitHub CLI">
      <command>gh --version</command>
      <validation>Ensure tool is available.</validation>
    </step>

    <step id="3" name="Analyze Changes">
      <instruction>Compare current changes with default branch (e.g., `main`).</instruction>
      <command>git diff main</command>
    </step>

    <step id="4" name="Local Validation">
      <prerequisite>Ensure all changes are saved.</prerequisite>
      <command>npm run lint ; npm test</command>
      <validation>Ensure code follows standards and all tests pass locally.</validation>
      <on_failure>
        <instruction>Fix linting errors or failing tests before proceeding.</instruction>
        <retry_step />
      </on_failure>
    </step>

    <step id="5" name="Update Project Context">
      <instruction>Review `GEMINI.md`. Make a deep comparison with current project state and update if tech stack/project structure/conventions/architecture changed.</instruction>
    </step>

    <step id="6" name="Cleanup">
      <task>Remove temporary logs or test artifacts that are NOT useful anymore (*.log, *.txt).</task>
      <status>Ensure the workspace is clean.</status>
    </step>

    <step id="7" name="Create Feature Branch">
      <instruction>Ensure you have the latest from main before branching.</instruction>
      <command>git fetch origin main ; git checkout -b &lt;descriptive-branch-name&gt; origin/main</command>
    </step>

    <step id="8" name="Stage and Commit">
      <command>git add .</command>
      <command>git commit -m &quot;&lt;conventional-commit-message&gt;&quot;</command>
    </step>

    <step id="9" name="Push and Create draft PR">
      <command>git push origin &lt;branch-name&gt;</command>
      <command>gh pr create --draft</command>
      <pr_description_requirements>
        <note importance=\"critical\">The description MUST be descriptive, smart, explicit, and well-summarized.</note>
        <structure>
          <section name=\"Context\">The 'Why' and Story/Issue IDs.</section>
          <section name=\"Technical Depth\">Architectural decisions and trade-offs.</section>
          <section name=\"Significant Changes\">Explicit logic changes (avoid generic lists).</section>
          <section name=\"Impact\">Performance, security, UX, maintainability improvements.</section>
          <section name=\"Verification\">List of tests performed and evidence of success.</section>
        </structure>
        <template>
          <![CDATA[
          ## Context
          [Short description]
          
          ## Changes
          - **[Category]**: [Key logic changes]
          
          ## Architectural Decisions
          [Explain the 'why' and trade-offs]
          
          ## Impact
          [Performance, security, UX, etc.]
          
          ## Verification
          [Tests and evidence]
          ]]>
        </template>
      </pr_description_requirements>
    </step>

    <step id="10" name="Verify CI Status">
      <command_watch>gh pr checks --watch</command_watch>
      <on_failure>
        <restriction>NEVER attempt random fixes.</restriction>
        <instruction>Use the @[systematic-debugging] skill.</instruction>
        <recovery_logic>
          <call step=\"4\" />
          <call step=\"8\" />
          <call step=\"9\" />
          <retry_step />
        </recovery_logic>
      </on_failure>
    </step>

    <step id="11" name="Notify for Review">
      <action>Once CI passes perfectly: Notify user and provide the PR link.</action>
    </step>
  </steps>
</workflow>
````
