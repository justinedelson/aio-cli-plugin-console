/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { Command } = require('@oclif/command')
const { stdout } = require('stdout-stderr')
const sdk = require('@adobe/aio-lib-console')
const SelectCommand = require('../../../../src/commands/console/workspace/select')
const { CONFIG_KEYS } = require('../../../../src/config')

const getWorkspace = () => ({
  ok: true,
  body: { id: 111, name: 'workspace1', enabled: 1 }
})

test('exports', async () => {
  expect(typeof SelectCommand).toEqual('function')
  expect(SelectCommand.prototype instanceof Command).toBeTruthy()
})

test('description', async () => {
  expect(SelectCommand.description).toBeDefined()
})

test('aliases', async () => {
  expect(SelectCommand.aliases).toBeDefined()
  expect(SelectCommand.aliases).toBeInstanceOf(Array)
  expect(SelectCommand.aliases.length).toBeGreaterThan(0)
})

test('args', async () => {
  const workspaceId = SelectCommand.args[0]
  expect(workspaceId.name).toEqual('workspaceId')
  expect(workspaceId.required).toEqual(true)
})

describe('console:workspace:select', () => {
  let command

  beforeEach(() => {
    command = new SelectCommand([])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('exists', async () => {
    expect(command.run).toBeInstanceOf(Function)
  })

  describe('successfully select workspace', () => {
    beforeEach(() => {
      sdk.init.mockImplementation(() => ({ getWorkspace }))
      command.getConfig = jest.fn(() => '111')
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    test('should select the provided workspace', async () => {
      command.argv = ['111']
      await expect(command.run()).resolves.not.toThrowError()
      expect(stdout.output).toMatchFixture('workspace/select.txt')
    })
  })

  describe('fail to select workspaces', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    test('should throw error no org selected', async () => {
      command.argv = ['111']
      await expect(command.run()).rejects.toThrowError()
      expect(stdout.output).toMatchFixture('workspace/select-error1.txt')
    })

    test('should throw error no project selected', async () => {
      command.argv = ['111']
      command.getConfig = jest.fn()
      command.getConfig.mockImplementation(key => {
        if (key === CONFIG_KEYS.ORG) {
          return { name: 'THE_ORG', id: 123 }
        }
        if (key === `${CONFIG_KEYS.ORG}.name`) {
          return 'THE_ORG'
        }
        return null
      })
      await expect(command.run()).rejects.toThrowError()
      expect(stdout.output).toMatchFixture('workspace/select-error2.txt')
    })

    test('should throw Error retrieving Project', async () => {
      const getWs = () => ({
        ok: false
      })
      command.argv = ['1']
      command.getConfig = jest.fn(() => {
        return {}
      })
      sdk.init.mockImplementation(() => ({ getWorkspace: getWs }))
      await expect(command.run()).rejects.toThrowError('Error retrieving Workspace')
    })
  })
})
