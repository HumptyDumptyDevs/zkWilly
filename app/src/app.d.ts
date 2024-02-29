import { SupabaseClient, Session } from '@supabase/supabase-js';
import { Database } from '$src/DatabaseDefinitions';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>;
			getSession(): Promise<Session | null>;
		}
		interface PageData {
			session: Session | null;
		}
	}

	interface Txns {
		timestamp: string;
		hash: string;
		valueEth: number;
		valueUsd: number;
		from: string;
		to: string;
	}
}
