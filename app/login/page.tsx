'use client'
import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { ref, push, serverTimestamp } from 'firebase/database'
import { getFirebaseAuth, getDb } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const auth = getFirebaseAuth()
    const unsub = onAuthStateChanged(auth, user => {
      if (user) router.replace('/')
      else setChecking(false)
    })
    return unsub
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const auth = getFirebaseAuth()
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const db = getDb()
      await push(ref(db, 'sessions'), {
        uid:       cred.user.uid,
        email:     cred.user.email,
        loginAt:   serverTimestamp(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        timestamp: new Date().toISOString(),
      })
      router.replace('/')
    } catch (err: unknown) {
      const code = (err as {code?:string})?.code
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Invalid email or password.')
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.')
      } else {
        setError('Login failed. Please try again.')
      }
      setLoading(false)
    }
  }

  if (checking) return (
    <div style={{minHeight:'100vh',background:'#080c14',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:32,height:32,border:'3px solid #1e2d42',borderTopColor:'#3b82f6',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#060912 0%,#0a0f1e 50%,#060912 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'"DM Sans","Segoe UI",system-ui,sans-serif',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(59,130,246,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.03) 1px,transparent 1px)',backgroundSize:'60px 60px',pointerEvents:'none'}}/>
      <div style={{position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',width:600,height:600,background:'radial-gradient(ellipse,rgba(59,130,246,0.06) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{width:'100%',maxWidth:400,padding:'0 24px',position:'relative',zIndex:1}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:14,marginBottom:24}}>
            <Image src="/logo-dark.png" alt="Autonomi" width={52} height={52} style={{borderRadius:10,objectFit:'contain'}}/>
            <div style={{textAlign:'left'}}>
              <div style={{fontSize:22,fontWeight:900,color:'#fff',letterSpacing:'-0.02em',lineHeight:1}}>Autonomi</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.35)',marginTop:3,letterSpacing:'0.05em'}}>INTELLIGENCE PLATFORM</div>
            </div>
          </div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.4)',lineHeight:1.6}}>
            Investor & Partner Access<br/>
            <span style={{fontSize:11,color:'rgba(255,255,255,0.2)'}}>Confidential — Do not distribute</span>
          </div>
        </div>
        <div style={{background:'rgba(17,24,39,0.8)',border:'1px solid rgba(59,130,246,0.15)',borderRadius:16,padding:'32px',backdropFilter:'blur(12px)',boxShadow:'0 24px 48px rgba(0,0,0,0.5)'}}>
          <div style={{fontSize:16,fontWeight:700,color:'#fff',marginBottom:6}}>Sign in</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.35)',marginBottom:28}}>Access requires an authorised account</div>
          <form onSubmit={handleLogin}>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.45)',letterSpacing:'0.08em',textTransform:'uppercase' as const,display:'block',marginBottom:8}}>Email</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"
                style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',borderRadius:8,padding:'10px 14px',fontSize:14,outline:'none',boxSizing:'border-box' as const}}/>
            </div>
            <div style={{marginBottom:24}}>
              <label style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.45)',letterSpacing:'0.08em',textTransform:'uppercase' as const,display:'block',marginBottom:8}}>Password</label>
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',borderRadius:8,padding:'10px 14px',fontSize:14,outline:'none',boxSizing:'border-box' as const}}/>
            </div>
            {error&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#fca5a5',marginBottom:20}}>{error}</div>}
            <button type="submit" disabled={loading}
              style={{width:'100%',padding:'12px',background:loading?'rgba(59,130,246,0.4)':'linear-gradient(135deg,#1d4ed8,#3b82f6)',color:'#fff',border:'none',borderRadius:8,fontSize:14,fontWeight:700,cursor:loading?'default':'pointer',boxShadow:loading?'none':'0 4px 16px rgba(59,130,246,0.3)'}}>
              {loading?'Signing in…':'Sign in →'}
            </button>
          </form>
        </div>
        <div style={{textAlign:'center',marginTop:24,fontSize:11,color:'rgba(255,255,255,0.15)',lineHeight:1.8}}>
          This platform contains confidential Autonomi business intelligence.<br/>Unauthorised access or distribution is prohibited.
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input::placeholder{color:rgba(255,255,255,0.2)!important}`}</style>
    </div>
  )
}
