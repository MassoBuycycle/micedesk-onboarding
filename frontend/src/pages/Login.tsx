import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const Login: React.FC = () => {
  const { login, error, loading } = useAuth();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  // Form validation schema
  const loginSchema = z.object({
    email: z.string().email({ message: t('pages.login.emailRequired') }),
    password: z.string().min(1, { message: t('pages.login.passwordRequired') }),
  });

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    await login({
      email: values.email,
      password: values.password,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">{t('pages.login.title')}</CardTitle>
            <CardDescription className="text-center">
              {t('pages.login.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('pages.login.email')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('pages.login.emailPlaceholder')} 
                          {...field} 
                          autoComplete="username" 
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('pages.login.password')}</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showPassword ? 'text' : 'password'} 
                            placeholder={t('pages.login.passwordPlaceholder')} 
                            {...field} 
                            autoComplete="current-password"
                            disabled={loading}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showPassword ? t('pages.login.hidePassword') : t('pages.login.showPassword')}
                          </span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('pages.login.loggingIn')}
                    </>
                  ) : (
                    t('pages.login.login')
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-center text-sm text-muted-foreground px-6 mb-2">
              {t('pages.login.termsText')}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login; 