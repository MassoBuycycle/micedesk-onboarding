import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, Calendar, Users, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface ContractOnboardingPreviewProps {
  contractData?: any;
}

const ContractOnboardingPreview: React.FC<ContractOnboardingPreviewProps> = ({ contractData = {} }) => {
  const { t } = useTranslation();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return format(date, "dd.MM.yyyy", { locale: de });
    } catch {
      return dateString;
    }
  };

  const formatBoolean = (value: boolean | undefined) => {
    if (value === undefined) return null;
    return value ? (
      <Badge variant="default" className="gap-1">
        <CheckCircle className="h-3 w-3" />
        {t('common.yes')}
      </Badge>
    ) : (
      <Badge variant="secondary" className="gap-1">
        <XCircle className="h-3 w-3" />
        {t('common.no')}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Contracting Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('contract.contracting')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contractData.contract_model && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('contract.contractModel')}</span>
                <span className="text-sm font-medium">{contractData.contract_model}</span>
              </div>
            )}
            
            {contractData.fte_count !== undefined && contractData.fte_count !== null && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('contract.fteCount')}</span>
                <span className="text-sm font-medium">{contractData.fte_count}</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              {contractData.onboarding_date && (
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {t('contract.onboardingDate')}
                  </p>
                  <p className="text-sm font-medium">{formatDate(contractData.onboarding_date)}</p>
                </div>
              )}
              
              {contractData.contract_start_date && (
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {t('contract.contractStartDate')}
                  </p>
                  <p className="text-sm font-medium">{formatDate(contractData.contract_start_date)}</p>
                </div>
              )}
            </div>
            
            {contractData.special_agreements && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">{t('contract.specialAgreements')}</p>
                <p className="text-sm whitespace-pre-wrap">{contractData.special_agreements}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technical Setup Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('contract.technicalSetup')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('contract.emailAddressesCreated')}</span>
              {formatBoolean(contractData.email_addresses_created)}
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-2">{t('contract.systemAccess')}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('contract.pmsSystem')}</span>
                  {formatBoolean(contractData.access_pms_system)}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('contract.scTool')}</span>
                  {formatBoolean(contractData.access_sc_tool)}
                </div>
                
                {contractData.access_other_systems && contractData.access_other_systems.length > 0 && (
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-2">{t('contract.otherSystems')}</p>
                    <div className="flex flex-wrap gap-1">
                      {contractData.access_other_systems.map((system: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {system}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractOnboardingPreview; 