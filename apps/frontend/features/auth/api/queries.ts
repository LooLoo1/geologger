import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../../shared/api/auth';
import { useAuthStore } from '../../../entities/user/model/store';

export const useLoginMutation = () => {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

export const useRegisterMutation = () => {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

