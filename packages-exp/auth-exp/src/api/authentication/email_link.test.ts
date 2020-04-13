/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { signInWithEmailLink } from './email_link';
import { Endpoint } from '..';
import { ServerError } from '../errors';
import { FirebaseError } from '@firebase/util';
import * as mockFetch from '../../../test/mock_fetch';
import { mockEndpoint, mockAuth } from '../../../test/api/helper';

use(chaiAsPromised);

describe('signInWithEmailLink', () => {
  const request = {
    email: 'foo@bar.com',
    oobCode: 'my-code'
  };

  beforeEach(mockFetch.setUp);
  afterEach(mockFetch.tearDown);

  it('should POST to the correct endpoint', async () => {
    const mock = mockEndpoint(Endpoint.SIGN_IN_WITH_EMAIL_LINK, {
      displayName: 'my-name',
      email: 'test@foo.com'
    });

    const response = await signInWithEmailLink(mockAuth, request);
    expect(response.displayName).to.eq('my-name');
    expect(response.email).to.eq('test@foo.com');
    expect(mock.calls[0].request).to.eql(request);
    expect(mock.calls[0].method).to.eq('POST');
    expect(mock.calls[0].headers).to.eql({
      'Content-Type': 'application/json'
    });
  });

  it('should handle errors', async () => {
    const mock = mockEndpoint(
      Endpoint.SIGN_IN_WITH_EMAIL_LINK,
      {
        error: {
          code: 400,
          message: ServerError.INVALID_EMAIL,
          errors: [
            {
              message: ServerError.INVALID_EMAIL
            }
          ]
        }
      },
      400
    );

    await expect(signInWithEmailLink(mockAuth, request)).to.be.rejectedWith(
      FirebaseError,
      'Firebase: The email address is badly formatted. (auth/invalid-email).'
    );
    expect(mock.calls[0].request).to.eql(request);
  });
});