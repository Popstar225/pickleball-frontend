/**
 * PreflightValidationPanel.tsx
 *
 * Displays detailed validation results before tournament start
 * Shows blocking issues (red), warnings (yellow), and pass checks (green)
 */

import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function PreflightValidationPanel(props: any = {}) {
  const validation = props.validation || {};
  const {
    isValid = false,
    events = [],
    issues = [],
    warnings = [],
    checks = [],
    summary = '',
  } = validation;

  // Separate issues by severity
  const blockingIssues = issues.filter((i) => i.severity === 'error' || i.severity === 'blocking');
  const warningIssues = issues.filter((i) => i.severity === 'warning');
  const passedChecks = checks.filter((c) => c.passed === true);

  return (
    <div className="space-y-4">
      {/* Overall Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isValid ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-600">Tournament Ready</span>
              </>
            ) : blockingIssues.length > 0 ? (
              <>
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-600">Issues Found</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-600">Review Warnings</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary && <p className="text-sm text-gray-700">{summary}</p>}
          {!isValid && (
            <p className="text-xs text-gray-600 mt-2">
              Resolve all blocking issues before starting the tournament.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Blocking Issues */}
      {blockingIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong className="block mb-2">Blocking Issues ({blockingIssues.length})</strong>
            <ul className="space-y-2 list-disc list-inside">
              {blockingIssues.map((issue, idx) => (
                <li key={idx} className="text-sm">
                  <span className="font-medium">{issue.event}</span>: {issue.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {warningIssues.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong className="block mb-2">Warnings ({warningIssues.length})</strong>
            <ul className="space-y-2 list-disc list-inside">
              {warningIssues.map((warning, idx) => (
                <li key={idx} className="text-sm">
                  <span className="font-medium">{warning.event}</span>: {warning.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Passed Checks */}
      {passedChecks.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <strong className="block mb-3 text-green-900">
              Passed Validations ({passedChecks.length})
            </strong>
            <ul className="space-y-2">
              {passedChecks.map((check, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-green-900">{check.name}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Event-by-Event Status */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event Status Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.map((evt) => (
                <div key={evt.id} className="p-3 bg-gray-50 rounded border">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-medium text-sm">
                        {evt.skill_block} {evt.gender} {evt.modality}
                      </p>
                      <p className="text-xs text-gray-600">{evt.format}</p>
                    </div>
                    <div className="text-right">
                      {evt.status === 'ready' && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-600">Ready</span>
                        </div>
                      )}
                      {evt.status === 'warning' && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs font-medium text-yellow-600">Warning</span>
                        </div>
                      )}
                      {evt.status === 'blocked' && (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-xs font-medium text-red-600">Blocked</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">
                    {evt.current_participants}/{evt.max_participants} registered
                  </p>
                  {evt.issues && <p className="text-xs text-red-600 mt-2">{evt.issues}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {blockingIssues.length === 0 && warningIssues.length === 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="font-semibold text-green-900">All validations passed</p>
            <p className="text-sm text-green-700">Tournament is ready to start</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
