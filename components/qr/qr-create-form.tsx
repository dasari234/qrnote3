'use client';

import { QrAdvancedSection } from '@/components/qr/create/qr-advanced-section';
import { QrBrandingSection } from '@/components/qr/create/qr-branding-section';
import { QrContentSection } from '@/components/qr/create/qr-content-section';
import { QrCreateHeader } from '@/components/qr/create/qr-create-header';
import { QrCreatePreview } from '@/components/qr/create/qr-create-preview';
import { QrOrganizationSection } from '@/components/qr/create/qr-organization-section';
import { QrTypeSelector } from '@/components/qr/create/qr-type-selector';

import { Button } from '@/components/ui/button';

import { createQrCode } from '@/lib/qr/actions';
import { QR_TYPES } from '@/lib/qr/types';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { QRStyle, QRType } from '@/lib/types';

import { ArrowLeft, ArrowRight, Check, Loader2, Save } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { QrCreateStep, QrCreateSteps } from './create/qr-create-steps';

interface Props {
  workspaceId: string;
  folders: {
    id: string;
    name: string;
  }[];
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
}

export function QrCreateForm({
  workspaceId,
  folders,
  tags,
}: Props) {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  /* -------------------------------------------------------------------------- */
  /* Core form state                                                            */
  /* -------------------------------------------------------------------------- */

  const [name, setName] = useState('');
  const [type, setType] = useState<QRType>('url');

  const [payload, setPayload] = useState<
    Record<string, any>
  >({});

  const [isDynamic, setIsDynamic] = useState(true);

  const [style, setStyle] = useState<QRStyle>({
    fgColor: '#000000',
    bgColor: '#ffffff',
    templateId: 'classic-black',
  });

  /* -------------------------------------------------------------------------- */
  /* Organization                                                               */
  /* -------------------------------------------------------------------------- */

  const [folderId, setFolderId] = useState('');
  const [selectedTags, setSelectedTags] = useState<
    string[]
  >([]);

  /* -------------------------------------------------------------------------- */
  /* Advanced                                                                   */
  /* -------------------------------------------------------------------------- */

  const [expiresAt, setExpiresAt] = useState<
    string | null
  >(null);

  const [shortCode, setShortCode] = useState('');

  const [variant, setVariant] = useState<
    string | null
  >(null);

  const [testName, setTestName] = useState('');

  const [suggestedCode, setSuggestedCode] =
    useState('');

  /* -------------------------------------------------------------------------- */
  /* UI                                                                          */
  /* -------------------------------------------------------------------------- */

  const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] =
    useState<QrCreateStep>(
      'content'
    );

  const typeDef = useMemo(
    () =>
      QR_TYPES.find(
        (item) => item.type === type
      )!,
    [type]
  );

  /* -------------------------------------------------------------------------- */
  /* Helpers                                                                     */
  /* -------------------------------------------------------------------------- */

  const handleTypeChange = (nextType: QRType) => {
    setType(nextType);

    // Reset content when QR type changes.
    setPayload({});
  };

  const handleFieldChange = (
    key: string,
    value: string
  ) => {
    setPayload((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleNameChange = (value: string) => {
    setName(value);

    const suggested = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 20);

    setSuggestedCode(suggested);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((previous) => {
      if (previous.includes(tagId)) {
        return previous.filter(
          (id) => id !== tagId
        );
      }

      return [...previous, tagId];
    });
  };

  /* -------------------------------------------------------------------------- */
  /* Submit                                                                      */
  /* -------------------------------------------------------------------------- */

  const validateContent =
    (): boolean => {
      if (!name.trim()) {
        toast.error(
          'Please give your QR code a name'
        );

        return false;
      }

      const requiredFields =
        typeDef?.fields.filter(
          (field) =>
            field.required
        ) || [];

      for (const field of requiredFields) {
        const value =
          payload[
            field.key
          ];

        if (
          typeof value !==
            'string' ||
          !value.trim()
        ) {
          toast.error(
            `${field.label} is required`
          );

          return false;
        }
      }

      return true;
  };

  const handleNext = () => {
    if (
      currentStep ===
      'content'
    ) {
      if (
        !validateContent()
      ) {
        return;
      }

      setCurrentStep(
        'advanced'
      );

      return;
    }

    if (
      currentStep ===
      'advanced'
    ) {
      setCurrentStep(
        'branding'
      );

      return;
    }
  };

  const handleBack = () => {
    if (
      currentStep ===
      'branding'
    ) {
      setCurrentStep(
        'advanced'
      );

      return;
    }

    if (
      currentStep ===
      'advanced'
    ) {
      setCurrentStep(
        'content'
      );

      return;
    }
  };

  const handleSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      if (!name.trim()) {
        toast.error(
          'Please give your QR code a name'
        );

        return;
      }

      const requiredFields =
        typeDef.fields.filter(
          (field) => field.required
        );

      for (const field of requiredFields) {
        const value = payload[field.key];

        if (
          typeof value !== 'string' ||
          !value.trim()
        ) {
          toast.error(
            `${field.label} is required`
          );

          return;
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error(
          'You must be signed in'
        );

        return;
      }

      await createQrCode({
        workspaceId,
        name: name.trim(),
        type,
        payload,
        isDynamic,
        style,
        createdBy: user.id,
        folderId:
          folderId || undefined,
        tagIds: selectedTags,
        customShortCode:
          shortCode || undefined,
        expiresAt: expiresAt
          ? new Date(expiresAt)
          : undefined,
        variant:
          variant || undefined,
        testName:
          testName || undefined,
      });

      toast.success(
        'QR code created successfully'
      );

      router.refresh();
      router.push('/dashboard/qr');
    } catch (error: any) {
      toast.error(
        error?.message ||
          'Failed to create QR code'
      );
    } finally {
      setLoading(false);
    }
  };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    // If the user hits enter inside a standard text input field, block the auto-submit
    if (event.key === 'Enter' && (event.target as HTMLElement).tagName === 'INPUT') {
      event.preventDefault();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="min-h-screen bg-background"
    >
      <QrCreateHeader
        loading={loading}
        onBack={() => router.back()}
      />

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
          <main className="min-w-0">

            <QrCreateSteps
              currentStep={
                currentStep
              }
              onStepChange={
                setCurrentStep
              }
            />
            {currentStep ==='content' && (
              <div className="space-y-6">
                <QrTypeSelector
                  type={type}
                  onTypeChange={handleTypeChange}
                />

                <QrContentSection
                  typeDef={typeDef}
                  name={name}
                  payload={payload}
                  isDynamic={isDynamic}
                  onNameChange={handleNameChange}
                  onFieldChange={handleFieldChange}
                  onDynamicChange={setIsDynamic}
                />

                <QrOrganizationSection
                    folders={folders}
                    tags={tags}
                    folderId={folderId}
                    selectedTags={selectedTags}
                    onFolderChange={setFolderId}
                    onTagToggle={handleTagToggle}
                  />
              </div>
            )}


            {currentStep ==='advanced' && (
              <div className="space-y-6">
                 <div>
                  <h2 className="text-lg font-semibold">
                    Advanced settings
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Configure expiry,
                    short codes and
                    additional QR
                    behavior.
                  </p>
                </div>
                <QrAdvancedSection
                  typeDef={typeDef}
                  payload={payload}
                  onFieldChange={handleFieldChange}
                  expiresAt={expiresAt}
                  onExpiryChange={setExpiresAt}
                  shortCode={shortCode}
                  onShortCodeChange={setShortCode}
                  suggestedShortCode={suggestedCode}
                  variant={variant}
                  onVariantChange={setVariant}
                  testName={testName}
                  onTestNameChange={setTestName}
                />
              </div>
            )}

            {currentStep ==='branding' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">
                    Branding
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Customize the appearance
                    of your QR code.
                  </p>
                </div>
                <QrBrandingSection
                    style={style}
                    onStyleChange={setStyle}
                />

              </div>
            )}





            <div className="mt-8 flex items-center justify-between border-t border-border/70 pt-5">
<Button
                type="button"
                variant="outline"
                disabled={
                  currentStep ===
                    'content' ||
                  loading
                }
                onClick={
                  handleBack
                }
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {currentStep !==
              'branding' ? (
                <Button
                  type="button"
                  onClick={
                    handleNext
                  }
                  disabled={
                    loading
                  }
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={
                    loading
                  }
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating QR Code…
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Create QR Code
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* -------------------------------------------------------------- */}
            {/* Mobile create button                                            */}
            {/* -------------------------------------------------------------- */}

            <div className="mt-4 lg:hidden">
              {currentStep ===
                'branding' && (
                <Button
                  type="submit"
                  disabled={
                    loading
                  }
                  className="h-12 w-full font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating QR Code…
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create QR Code
                    </>
                  )}
                </Button>
              )}
            </div>
          </main>

          <QrCreatePreview
            type={type}
            typeLabel={typeDef?.label}
            payload={payload}
            name={name}
            isDynamic={isDynamic}
            style={style}
            loading={loading}
          />
        </div>
      </div>
    </form>
  );
}
